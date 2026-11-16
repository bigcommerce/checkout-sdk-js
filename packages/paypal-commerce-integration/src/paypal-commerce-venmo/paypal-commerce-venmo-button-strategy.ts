import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    PaypalButtonCreationService,
    PayPalButtonStyleOptions,
    PayPalBuyNowInitializeOptions,
    PayPalIntegrationService,
    StyleButtonColor,
} from '@bigcommerce/checkout-sdk/paypal-utils';

import PayPalCommerceVenmoButtonInitializeOptions, {
    WithPayPalCommerceVenmoButtonInitializeOptions,
} from './paypal-commerce-venmo-button-initialize-options';

export default class PayPalCommerceVenmoButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private paypalIntegrationService: PayPalIntegrationService,
        private paypalButtonCreationService: PaypalButtonCreationService,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithPayPalCommerceVenmoButtonInitializeOptions,
    ): Promise<void> {
        const { paypalcommercevenmo, containerId, methodId } = options;
        const { buyNowInitializeOptions, currencyCode: providedCurrencyCode } =
            paypalcommercevenmo || {};

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

        if (!paypalcommercevenmo) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercevenmo" argument is not provided.`,
            );
        }

        if (isBuyNowFlow && !providedCurrencyCode) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercevenmo.currencyCode" argument is not provided.`,
            );
        }

        if (
            isBuyNowFlow &&
            typeof buyNowInitializeOptions?.getBuyNowCartRequestBody !== 'function'
        ) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.paypalcommercevenmo.buyNowInitializeOptions.getBuyNowCartRequestBody" argument is not provided or it is not a function.`,
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

        this.renderButton(containerId, methodId, paypalcommercevenmo);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        paypalcommercevenmo: PayPalCommerceVenmoButtonInitializeOptions,
    ): void {
        const { buyNowInitializeOptions, style, onEligibilityFailure } = paypalcommercevenmo;

        const paypalSdk = this.paypalIntegrationService.getPayPalSdkOrThrow();
        const fundingSource = paypalSdk.FUNDING.VENMO;

        const buyNowFlowCallbacks = {
            onClick: () => this.handleClick(buyNowInitializeOptions),
            onCancel: () => this.paymentIntegrationService.loadDefaultCheckout(),
        };

        const buttonRenderOptions = {
            fundingSource,
            style: this.getValidVenmoButtonStyles(style),
            ...(buyNowInitializeOptions && buyNowFlowCallbacks),
        };

        const paypalButton = this.paypalButtonCreationService.createPayPalButton(
            'paypalcommerce',
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

    private getValidVenmoButtonStyles(style: PayPalButtonStyleOptions | undefined) {
        const validButtonStyle = this.paypalIntegrationService.getValidButtonStyle(style);

        if (validButtonStyle.color === StyleButtonColor.gold) {
            return {
                ...validButtonStyle,
                color: undefined,
            };
        }

        return validButtonStyle;
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
