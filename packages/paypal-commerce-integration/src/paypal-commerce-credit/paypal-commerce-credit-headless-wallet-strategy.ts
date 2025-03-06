import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import PayPalCommerceIntegrationService from '../paypal-commerce-integration-service';
import { ApproveCallbackPayload, PayPalCommerceButtonsOptions } from '../paypal-commerce-types';

import PaypalCommerceCreditHeadlessWalletInitializeOptions, {
    WithPayPalCommerceCreditHeadlessWalletInitializeOptions,
} from './paypal-commerce-credit-headless-wallet-initialize-options';

export default class PaypalCommerceCreditHeadlessWalletStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalCommerceIntegrationService: PayPalCommerceIntegrationService,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions &
            WithPayPalCommerceCreditHeadlessWalletInitializeOptions,
    ): Promise<void> {
        const { paypalcommercecredit, containerId, methodId } = options;

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

        if (!paypalcommercecredit) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercecredit" argument is not provided.`,
            );
        }

        const state = await this.paymentIntegrationService.loadCard(paypalcommercecredit.cartId);

        const currencyCode = state.getCartOrThrow().currency.code;

        await this.paypalCommerceIntegrationService.loadPayPalSdk(methodId, currencyCode, false);

        this.renderButton(containerId, paypalcommercecredit);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        paypalcommercecredit: PaypalCommerceCreditHeadlessWalletInitializeOptions,
    ): void {
        const { style, onEligibilityFailure } = paypalcommercecredit;

        const paypalSdk = this.paypalCommerceIntegrationService.getPayPalSdkOrThrow();

        const defaultCallbacks = {
            createOrder: () =>
                this.paypalCommerceIntegrationService.createPaymentOrderIntent(
                    'paypalcommerce.paypalcredit',
                ),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.paypalCommerceIntegrationService.proxyTokenizationPayment(orderID),
        };

        const fundingSources = [paypalSdk.FUNDING.PAYLATER, paypalSdk.FUNDING.CREDIT];
        let hasRenderedSmartButton = false;

        fundingSources.forEach((fundingSource) => {
            if (!hasRenderedSmartButton) {
                const buttonRenderOptions: PayPalCommerceButtonsOptions = {
                    fundingSource,
                    style: this.paypalCommerceIntegrationService.getValidButtonStyle(style),
                    ...defaultCallbacks,
                };

                const paypalButton = paypalSdk.Buttons(buttonRenderOptions);

                if (paypalButton.isEligible()) {
                    paypalButton.render(`#${containerId}`);
                    hasRenderedSmartButton = true;
                } else if (onEligibilityFailure && typeof onEligibilityFailure === 'function') {
                    onEligibilityFailure();
                }
            }
        });

        if (!hasRenderedSmartButton) {
            this.paypalCommerceIntegrationService.removeElement(containerId);
        }
    }
}
