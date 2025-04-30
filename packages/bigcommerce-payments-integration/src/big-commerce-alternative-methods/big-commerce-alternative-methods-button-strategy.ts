import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BigCommerceIntegrationService from '../big-commerce-integration-service';
import {
    ApproveCallbackPayload,
    BigCommerceButtonsOptions,
    BigCommerceBuyNowInitializeOptions,
} from '../big-commerce-types';

import BigCommerceAlternativeMethodsButtonOptions, {
    WithBigCommerceAlternativeMethodsButtonInitializeOptions,
} from './big-commerce-alternative-methods-button-initialize-options';

export default class BigCommerceAlternativeMethodsButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommerceIntegrationService: BigCommerceIntegrationService,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions &
            WithBigCommerceAlternativeMethodsButtonInitializeOptions,
    ): Promise<void> {
        const { bigcommerce_payments_apms, containerId, methodId } = options;
        const {
            apm,
            buyNowInitializeOptions,
            currencyCode: providedCurrencyCode,
        } = bigcommerce_payments_apms || {};

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

        if (!bigcommerce_payments_apms) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_payments_apms" argument is not provided.`,
            );
        }

        if (!apm) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_payments_apms.apm" argument is not provided.`,
            );
        }

        if (isBuyNowFlow && !providedCurrencyCode) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_payments_apms.currencyCode" argument is not provided.`,
            );
        }

        if (
            isBuyNowFlow &&
            typeof buyNowInitializeOptions?.getBuyNowCartRequestBody !== 'function'
        ) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_payments_apms.buyNowInitializeOptions.getBuyNowCartRequestBody" argument is not provided or it is not a function.`,
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

        await this.bigCommerceIntegrationService.loadBigCommerceSdk(methodId, currencyCode, false);

        this.renderButton(containerId, methodId, bigcommerce_payments_apms);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        bigcommerce_payments_apms: BigCommerceAlternativeMethodsButtonOptions,
    ): void {
        const { apm, buyNowInitializeOptions, style, onEligibilityFailure } =
            bigcommerce_payments_apms;

        const bigcommerceSdk = this.bigCommerceIntegrationService.getBigCommerceSdkOrThrow();
        const isAvailableFundingSource = Object.values(bigcommerceSdk.FUNDING).includes(apm);

        if (!isAvailableFundingSource) {
            throw new InvalidArgumentError(
                `Unable to initialize BigCommerce button because "options.bigcommerce_payments_apms.apm" argument is not valid funding source.`,
            );
        }

        const defaultCallbacks = {
            createOrder: () =>
                this.bigCommerceIntegrationService.createOrder('bigcommercealternativemethod'),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.bigCommerceIntegrationService.tokenizePayment(methodId, orderID),
        };

        const buyNowFlowCallbacks = {
            onClick: () => this.handleClick(buyNowInitializeOptions),
            onCancel: () => this.paymentIntegrationService.loadDefaultCheckout(),
        };

        const buttonRenderOptions: BigCommerceButtonsOptions = {
            fundingSource: apm,
            style: this.bigCommerceIntegrationService.getValidButtonStyle(style),
            ...defaultCallbacks,
            ...(buyNowInitializeOptions && buyNowFlowCallbacks),
        };

        const bigcommerceButtonRender = bigcommerceSdk.Buttons(buttonRenderOptions);

        if (bigcommerceButtonRender.isEligible()) {
            bigcommerceButtonRender.render(`#${containerId}`);
        } else if (onEligibilityFailure && typeof onEligibilityFailure === 'function') {
            onEligibilityFailure();
        } else {
            this.bigCommerceIntegrationService.removeElement(containerId);
        }
    }

    private async handleClick(
        buyNowInitializeOptions?: BigCommerceBuyNowInitializeOptions,
    ): Promise<void> {
        if (buyNowInitializeOptions) {
            const buyNowCart = await this.bigCommerceIntegrationService.createBuyNowCartOrThrow(
                buyNowInitializeOptions,
            );

            await this.paymentIntegrationService.loadCheckout(buyNowCart.id);
        }
    }
}
