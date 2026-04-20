import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    PaypalButtonCreationService,
    PayPalButtonOptions,
    PayPalInitializationData,
    PayPalIntegrationService,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceButtonInitializeOptions, {
    WithPayPalCommerceButtonInitializeOptions,
} from './paypal-commerce-button-initialize-options';

export default class PayPalCommerceButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalIntegrationService: PayPalIntegrationService,
        private paypalButtonCreationService: PaypalButtonCreationService,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithPayPalCommerceButtonInitializeOptions,
    ): Promise<void> {
        console.log('INITIALIZED', options);
        const { paypalcommerce, containerId, methodId } = options;

        const isBuyNowFlow = Boolean(paypalcommerce?.buyNowInitializeOptions);

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

        if (!paypalcommerce) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce" argument is not provided.`,
            );
        }

        if (isBuyNowFlow && !paypalcommerce.currencyCode) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce.currencyCode" argument is not provided.`,
            );
        }

        if (
            isBuyNowFlow &&
            typeof paypalcommerce.buyNowInitializeOptions?.getBuyNowCartRequestBody !== 'function'
        ) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommerce.buyNowInitializeOptions.getBuyNowCartRequestBody" argument is not provided or it is not a function.`,
            );
        }

        if (!isBuyNowFlow) {
            // Info: default checkout should not be loaded for BuyNow flow,
            // since there is no checkout session available for that.
            await this.paymentIntegrationService.loadDefaultCheckout();
        }

        // Info: we are using provided currency code for buy now cart,
        // because checkout session is not available before buy now cart creation,
        // hence application will throw an error on getCartOrThrow method call
        const currencyCode = isBuyNowFlow
            ? paypalcommerce.currencyCode
            : this.paymentIntegrationService.getState().getCartOrThrow().currency.code;

        await this.paypalIntegrationService.loadPayPalSdk(methodId, currencyCode, false);

        this.renderButton(containerId, methodId, paypalcommerce);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        paypalcommerce: PayPalCommerceButtonInitializeOptions,
    ): void {
        const { buyNowInitializeOptions, style, onComplete, onEligibilityFailure } = paypalcommerce;

        const paypalSdk = this.paypalIntegrationService.getPayPalSdkOrThrow();
        const state = this.paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow<PayPalInitializationData>(methodId);
        const { isHostedCheckoutEnabled, isAppSwitchEnabled } =
            paymentMethod.initializationData || {};

        const buyNowFlowCallbacks = {
            onCancel: () => this.paymentIntegrationService.loadDefaultCheckout(),
        };

        const buttonOptions: PayPalButtonOptions = {
            fundingSource: paypalSdk.FUNDING.PAYPAL,
            style: this.paypalIntegrationService.getValidButtonStyle(style),
            isAppSwitchEnabled,
            isHostedCheckoutEnabled,
            ...(buyNowInitializeOptions && buyNowFlowCallbacks),
            ...(isHostedCheckoutEnabled && onComplete && { onPaymentComplete: () => onComplete() }),
        };

        const paypalButton = this.paypalButtonCreationService.createPayPalButton(
            'paypalcommerce',
            methodId,
            buttonOptions,
            buyNowInitializeOptions,
        );

        if (paypalButton.isEligible()) {
            if (paypalButton.hasReturned?.() && isAppSwitchEnabled) {
                paypalButton.resume?.();
            } else {
                paypalButton.render(`#${containerId}`);
            }
        } else if (onEligibilityFailure && typeof onEligibilityFailure === 'function') {
            onEligibilityFailure();
        } else {
            this.paypalIntegrationService.removeElement(containerId);
        }
    }
}
