import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PayPalCommerceInitializationData } from '@bigcommerce/checkout-sdk/paypal-commerce-utils';
import { PaypalCommerceWalletService } from '@bigcommerce/checkout-sdk/paypal-utils';

import {
    ApproveCallbackActions,
    ApproveCallbackPayload,
    PayPalButtonStyleOptions,
    PayPalCommerceButtonsOptions,
} from '../paypal-commerce-types';

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
        providerId: string,
        cartId: string,
        buttonStyle?: PayPalButtonStyleOptions,
    ): void {
        const paypalSdk = this.paypalCommerceHeadlessWalletButtonService.getPayPalSdkOrThrow();
        const fundingSources = [paypalSdk.FUNDING.PAYLATER, paypalSdk.FUNDING.CREDIT];

        const defaultCallbacks = {
            createOrder: () =>
                this.paypalCommerceHeadlessWalletButtonService.createPaymentOrderIntent(
                    providerId,
                    cartId,
                ),
            onApprove: async (
                { orderID }: ApproveCallbackPayload,
                actions: ApproveCallbackActions,
            ) => {
                const orderDetails = await actions.order.get();
                const billingAddress =
                    this.paypalCommerceHeadlessWalletButtonService.mapOrderDetailsToBillingAddress(
                        orderDetails,
                    );

                await this.paypalCommerceHeadlessWalletButtonService.addBillingAddress(
                    cartId,
                    billingAddress,
                );

                await this.paypalCommerceHeadlessWalletButtonService.proxyTokenizationPayment(
                    cartId,
                    providerId,
                    'paypalcommercecredit',
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
}
