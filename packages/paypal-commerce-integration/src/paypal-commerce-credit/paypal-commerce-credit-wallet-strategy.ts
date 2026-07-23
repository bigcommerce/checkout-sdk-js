import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalCommerceInitializationData } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { AddressRequestBody } from '@bigcommerce/checkout-sdk/wallet-button-integration';

import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    PayPalButtonStyleOptions,
    PayPalCommerceButtonsOptions,
    PayPalOrderDetails,
} from '../paypal-commerce-types';
import PaypalCommerceWalletService from '../paypal-commerce-wallet-service';

import { WithPayPalCommerceCreditWalletInitializeOptions } from './paypal-commerce-credit-wallet-initialize-options';

export default class PayPalCommerceCreditWalletStrategy implements CheckoutButtonStrategy {
    constructor(private paypalCommerceHeadlessWalletButtonService: PaypalCommerceWalletService) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithPayPalCommerceCreditWalletInitializeOptions,
    ): Promise<void> {
        const { paypalcommercepaypalcredit, containerId, methodId } = options;

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        if (!containerId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.containerId" argument is not provided.',
            );
        }

        if (!paypalcommercepaypalcredit) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.paypalcommercepaypalcredit" argument is not provided.',
            );
        }

        let parsedInitializationData: PaymentMethod<PayPalCommerceInitializationData>;

        try {
            parsedInitializationData = JSON.parse(
                atob(paypalcommercepaypalcredit.initializationData),
            );
        } catch {
            throw new InvalidArgumentError("Failed to parse payment method 'initializationData'.");
        }

        await this.paypalCommerceHeadlessWalletButtonService.loadPayPalSdk(
            parsedInitializationData,
            paypalcommercepaypalcredit.currency.code,
            false,
        );

        const buttonStyle =
            parsedInitializationData.initializationData?.paymentButtonStyles?.cartButtonStyles;

        this.renderButton(
            containerId,
            'paypalcommerce.paypalcredit',
            paypalcommercepaypalcredit.cartId,
            buttonStyle,
        );
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        cartId: string,
        buttonStyle?: PayPalButtonStyleOptions,
    ): void {
        const paypalSdk = this.paypalCommerceHeadlessWalletButtonService.getPayPalSdkOrThrow();
        const fundingSources = [paypalSdk.FUNDING.PAYLATER, paypalSdk.FUNDING.CREDIT];

        const defaultCallbacks = {
            createOrder: () =>
                this.paypalCommerceHeadlessWalletButtonService.createPaymentOrderIntent(
                    methodId,
                    cartId,
                ),
            onApprove: async (
                { orderID }: ApproveCallbackPayload,
                actions: ApproveCallbackActions,
            ) => {
                const orderDetails = await actions.order.get();
                const billingAddress = this.mapOrderDetailsToBillingAddress(orderDetails);

                await this.paypalCommerceHeadlessWalletButtonService.addBillingAddress(
                    cartId,
                    billingAddress,
                );

                await this.paypalCommerceHeadlessWalletButtonService.proxyTokenizationPayment(
                    cartId,
                    orderID,
                );
            },
        };

        let hasRenderedSmartButton = false;

        fundingSources.forEach((fundingSource) => {
            if (!hasRenderedSmartButton) {
                const buttonRenderOptions: PayPalCommerceButtonsOptions = {
                    fundingSource,
                    style: this.paypalCommerceHeadlessWalletButtonService.getValidButtonStyle(
                        buttonStyle,
                    ),
                    ...defaultCallbacks,
                };

                const paypalButton = paypalSdk.Buttons(buttonRenderOptions);

                if (paypalButton.isEligible()) {
                    paypalButton.render(`#${containerId}`);
                    hasRenderedSmartButton = true;
                }
            }
        });

        if (!hasRenderedSmartButton) {
            this.paypalCommerceHeadlessWalletButtonService.removeElement(containerId);
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
