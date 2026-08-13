import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaypalCommerceWalletService } from '@bigcommerce/checkout-sdk/paypal-utils';

import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    BigCommercePaymentsButtonsOptions,
    BigCommercePaymentsInitializationData,
    PayPalButtonStyleOptions,
} from '../bigcommerce-payments-types';

import { WithBigCommercePaymentsPayLaterWalletInitializeOptions } from './bigcommerce-payments-paylater-wallet-initialize-options';

export default class BigCommercePaymentsPayLaterWalletStrategy implements CheckoutButtonStrategy {
    constructor(private bigCommercePaymentsPayLaterWalletService: PaypalCommerceWalletService) {}

    async initialize(
        options: CheckoutButtonInitializeOptions &
            WithBigCommercePaymentsPayLaterWalletInitializeOptions,
    ): Promise<void> {
        const { bigcommerce_paymentspaypalcredit, containerId, methodId } = options;

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

        if (!bigcommerce_paymentspaypalcredit) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_paymentspaypalcredit" argument is not provided.`,
            );
        }

        let parsedInitializationData: PaymentMethod<BigCommercePaymentsInitializationData>;

        try {
            parsedInitializationData = JSON.parse(
                atob(bigcommerce_paymentspaypalcredit.initializationData),
            );
        } catch {
            throw new InvalidArgumentError("Failed to parse payment method 'initializationData'.");
        }

        const buttonStyle =
            parsedInitializationData.initializationData?.paymentButtonStyles?.cartButtonStyles;

        await this.bigCommercePaymentsPayLaterWalletService.loadPayPalSdk(
            parsedInitializationData,
            bigcommerce_paymentspaypalcredit.currency.code,
            false,
        );

        this.renderButton(
            containerId,
            'bigcommerce_payments.paypalcredit',
            bigcommerce_paymentspaypalcredit.cartId,
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
        const paypalSdk = this.bigCommercePaymentsPayLaterWalletService.getPayPalSdkOrThrow();
        const fundingSources = [paypalSdk.FUNDING.PAYLATER, paypalSdk.FUNDING.CREDIT];

        const defaultCallbacks = {
            createOrder: () =>
                this.bigCommercePaymentsPayLaterWalletService.createPaymentOrderIntent(
                    providerId,
                    cartId,
                ),
            onApprove: async (
                { orderID }: ApproveCallbackPayload,
                actions: ApproveCallbackActions,
            ) => {
                const orderDetails = await actions.order.get();
                const billingAddress =
                    this.bigCommercePaymentsPayLaterWalletService.mapOrderDetailsToBillingAddress(
                        orderDetails,
                    );

                await this.bigCommercePaymentsPayLaterWalletService.addBillingAddress(
                    cartId,
                    billingAddress,
                );
                await this.bigCommercePaymentsPayLaterWalletService.proxyTokenizationPayment(
                    cartId,
                    providerId,
                    'bigcommerce_payments_paylater',
                    orderID,
                );
            },
        };

        let hasRenderedSmartButton = false;

        fundingSources.forEach((fundingSource) => {
            if (!hasRenderedSmartButton) {
                const buttonRenderOptions: BigCommercePaymentsButtonsOptions = {
                    fundingSource,
                    style: this.bigCommercePaymentsPayLaterWalletService.getValidButtonStyle(
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
            this.bigCommercePaymentsPayLaterWalletService.removeElement(containerId);
        }
    }
}
