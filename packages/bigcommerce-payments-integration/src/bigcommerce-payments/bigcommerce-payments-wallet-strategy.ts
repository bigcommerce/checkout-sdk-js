import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { AddressRequestBody } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    BigCommercePaymentsButtonsOptions,
    BigCommercePaymentsInitializationData,
    PayPalButtonStyleOptions,
    PayPalOrderDetails,
} from '../bigcommerce-payments-types';
import BigCommercePaymentsWalletService from '../bigcommerce-payments-wallet-service';

import { WithBigCommercePaymentsWalletInitializeOptions } from './bigcommerce-payments-wallet-initialize-options';

export default class BigCommercePaymentsWalletStrategy implements CheckoutButtonStrategy {
    constructor(private bigCommercePaymentsWalletService: BigCommercePaymentsWalletService) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithBigCommercePaymentsWalletInitializeOptions,
    ): Promise<void> {
        const { bigcommerce_paymentspaypal, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!containerId) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.containerId" argument is not provided.`,
            );
        }

        if (!bigcommerce_paymentspaypal) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_paymentspaypal" argument is not provided.`,
            );
        }

        let parsedInitializationData: PaymentMethod<BigCommercePaymentsInitializationData>;

        try {
            parsedInitializationData = JSON.parse(
                atob(bigcommerce_paymentspaypal.initializationData),
            );
        } catch {
            throw new InvalidArgumentError("Failed to parse payment method 'initializationData'.");
        }

        const buttonStyle =
            parsedInitializationData.initializationData?.paymentButtonStyles?.cartButtonStyles;

        await this.bigCommercePaymentsWalletService.loadPayPalSdk(
            parsedInitializationData,
            bigcommerce_paymentspaypal.currency.code,
            false,
        );

        this.renderButton(
            containerId,
            'bigcommerce_payments.paypal',
            bigcommerce_paymentspaypal.cartId,
            buttonStyle,
        );
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        providerId: string,
        cartId: string,
        buttonStyle?: PayPalButtonStyleOptions,
    ): void {
        const paypalSdk = this.bigCommercePaymentsWalletService.getPayPalSdkOrThrow();

        const defaultCallbacks = {
            createOrder: () =>
                this.bigCommercePaymentsWalletService.createPaymentOrderIntent(providerId, cartId),
            onApprove: async (
                { orderID }: ApproveCallbackPayload,
                actions: ApproveCallbackActions,
            ) => {
                const orderDetails = await actions.order.get();
                const billingAddress = this.mapOrderDetailsToBillingAddress(orderDetails);

                await this.bigCommercePaymentsWalletService.addBillingAddress(
                    cartId,
                    billingAddress,
                );
                await this.bigCommercePaymentsWalletService.proxyTokenizationPayment(
                    cartId,
                    providerId,
                    'bigcommerce_payments',
                    orderID,
                );
            },
        };

        const buttonRenderOptions: BigCommercePaymentsButtonsOptions = {
            fundingSource: paypalSdk.FUNDING.PAYPAL,
            style: this.bigCommercePaymentsWalletService.getValidButtonStyle(buttonStyle),
            ...defaultCallbacks,
        };

        const paypalButton = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${containerId}`);
        } else {
            this.bigCommercePaymentsWalletService.removeElement(containerId);
        }
    }

    private mapOrderDetailsToBillingAddress(orderDetails: PayPalOrderDetails): AddressRequestBody {
        const { payer } = orderDetails;

        return {
            firstName: payer.name.given_name,
            lastName: payer.name.surname,
            company: '',
            address1: payer.address.address_line_1,
            address2: payer.address.address_line_2,
            city: payer.address.admin_area_2,
            email: payer.email_address,
            stateOrProvince: payer.address.admin_area_1 ?? '',
            stateOrProvinceCode: payer.address.admin_area_1 ?? '',
            countryCode: payer.address.country_code,
            postalCode: payer.address.postal_code,
            phone: payer.phone?.phone_number.national_number ?? '',
            shouldSaveAddress: false,
        };
    }
}
