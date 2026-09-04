import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    PaypalButtonCreationService,
    PayPalBuyNowInitializeOptions,
    PayPalInitializationData,
    PayPalIntegrationService,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceCreditButtonInitializeOptions, {
    WithPayPalCommerceCreditButtonInitializeOptions,
} from './paypal-commerce-credit-button-initialize-options';

export default class PayPalCommerceCreditButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalIntegrationService: PayPalIntegrationService,
        private paypalButtonCreationService: PaypalButtonCreationService,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithPayPalCommerceCreditButtonInitializeOptions,
    ): Promise<void> {
        const { paypalcommercecredit, containerId, methodId } = options;
        const { buyNowInitializeOptions, currencyCode: providedCurrencyCode } =
            paypalcommercecredit || {};

        const isBuyNowFlow = !!buyNowInitializeOptions;

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

        if (isBuyNowFlow && !providedCurrencyCode) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercecredit.currencyCode" argument is not provided.`,
            );
        }

        if (
            isBuyNowFlow &&
            typeof buyNowInitializeOptions?.getBuyNowCartRequestBody !== 'function'
        ) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercecredit.buyNowInitializeOptions.getBuyNowCartRequestBody" argument is not provided or it is not a function.`,
            );
        }

        if (!isBuyNowFlow) {
            // Info: default checkout should not be loaded for BuyNow flow,
            // since there is no checkout session available for that.
            await this.paymentIntegrationService.loadDefaultCheckout();
        }

        const state = this.paymentIntegrationService.getState();

        // Info: we are using provided currency code for buy now cart,
        // because checkout session is not available before buy now cart creation,
        // hence application will throw an error on getCartOrThrow method call
        const currencyCode = isBuyNowFlow
            ? providedCurrencyCode
            : state.getCartOrThrow().currency.code;

        await this.paypalIntegrationService.loadPayPalSdk(methodId, currencyCode, false);

        this.renderButton(containerId, methodId, paypalcommercecredit);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        paypalcommercecredit: PayPalCommerceCreditButtonInitializeOptions,
    ): void {
        const { buyNowInitializeOptions, style, onComplete, onEligibilityFailure } =
            paypalcommercecredit;

        const paypalSdk = this.paypalIntegrationService.getPayPalSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalInitializationData>(methodId);
        const { isHostedCheckoutEnabled, isServerSideShippingCallbacksEnabled } =
            paymentMethod.initializationData || {};

        const buyNowFlowCallbacks = {
            onClick: () => this.handleClick(buyNowInitializeOptions),
            onCancel: () => this.paymentIntegrationService.loadDefaultCheckout(),
        };

        const fundingSources = [paypalSdk.FUNDING.PAYLATER, paypalSdk.FUNDING.CREDIT];
        let hasRenderedSmartButton = false;

        fundingSources.forEach((fundingSource) => {
            if (!hasRenderedSmartButton) {
                const buttonRenderOptions = {
                    fundingSource,
                    style: this.paypalIntegrationService.getValidButtonStyle(style),
                    isHostedCheckoutEnabled,
                    isServerSideShippingCallbacksEnabled,
                    buyNowInitializeOptions,
                    ...(isHostedCheckoutEnabled &&
                        onComplete && { onPaymentComplete: () => onComplete() }),
                    ...(buyNowInitializeOptions && buyNowFlowCallbacks),
                };

                const paypalButton = this.paypalButtonCreationService.createPayPalButton(
                    'paypalcommerce',
                    methodId,
                    buttonRenderOptions,
                );

                if (paypalButton.isEligible()) {
                    paypalButton.render(`#${containerId}`);
                    hasRenderedSmartButton = true;
                } else if (onEligibilityFailure && typeof onEligibilityFailure === 'function') {
                    onEligibilityFailure();
                }
            }
        });

        if (!hasRenderedSmartButton) {
            this.paypalIntegrationService.removeElement(containerId);
        }
    }

    private async handleClick(
        buyNowInitializeOptions?: PayPalBuyNowInitializeOptions,
    ): Promise<void> {
        if (buyNowInitializeOptions) {
            const buyNowCart = await this.paypalIntegrationService.createBuyNowCartOrThrow(
                buyNowInitializeOptions,
            );

            await this.paymentIntegrationService.loadCheckout(buyNowCart.id);
        }
    }
}
