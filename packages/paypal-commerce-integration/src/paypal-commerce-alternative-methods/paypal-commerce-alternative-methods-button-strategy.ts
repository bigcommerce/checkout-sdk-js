import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    PaypalButtonCreationService,
    PayPalBuyNowInitializeOptions,
    PayPalIntegrationService,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceAlternativeMethodsButtonOptions, {
    WithPayPalCommerceAlternativeMethodsButtonInitializeOptions,
} from './paypal-commerce-alternative-methods-button-initialize-options';

export default class PayPalCommerceAlternativeMethodsButtonStrategy
    implements CheckoutButtonStrategy
{
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalIntegrationService: PayPalIntegrationService,
        private paypalButtonCreationService: PaypalButtonCreationService,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions &
            WithPayPalCommerceAlternativeMethodsButtonInitializeOptions,
    ): Promise<void> {
        const { paypalcommercealternativemethods, containerId, methodId } = options;
        const {
            apm,
            buyNowInitializeOptions,
            currencyCode: providedCurrencyCode,
        } = paypalcommercealternativemethods || {};

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

        if (!paypalcommercealternativemethods) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercealternativemethods" argument is not provided.`,
            );
        }

        if (!apm) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercealternativemethods.apm" argument is not provided.`,
            );
        }

        if (isBuyNowFlow && !providedCurrencyCode) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercealternativemethods.currencyCode" argument is not provided.`,
            );
        }

        if (
            isBuyNowFlow &&
            typeof buyNowInitializeOptions?.getBuyNowCartRequestBody !== 'function'
        ) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercealternativemethods.buyNowInitializeOptions.getBuyNowCartRequestBody" argument is not provided or it is not a function.`,
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
            ? providedCurrencyCode
            : this.paymentIntegrationService.getState().getCartOrThrow().currency.code;

        await this.paypalIntegrationService.loadPayPalSdk(methodId, currencyCode, false);

        this.renderButton(containerId, methodId, paypalcommercealternativemethods);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        paypalcommercealternativemethods: PayPalCommerceAlternativeMethodsButtonOptions,
    ): void {
        const { apm, buyNowInitializeOptions, style, onEligibilityFailure } =
            paypalcommercealternativemethods;

        const buttonRenderOptions = {
            fundingSource: apm,
            style,
            ...(buyNowInitializeOptions && {
                onClick: () => this.handleClick(buyNowInitializeOptions),
                onCancel: () => this.paymentIntegrationService.loadDefaultCheckout(),
            }),
        };

        const paypalButton = this.paypalButtonCreationService.createPayPalButton(
            'paypalcommercealternativemethod',
            methodId,
            buttonRenderOptions,
        );

        if (paypalButton.isEligible()) {
            paypalButton.render(`#${containerId}`);
        } else if (onEligibilityFailure && typeof onEligibilityFailure === 'function') {
            onEligibilityFailure();
        } else {
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
