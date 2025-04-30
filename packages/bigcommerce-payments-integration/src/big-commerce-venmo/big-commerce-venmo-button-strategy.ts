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
    BigCommerceButtonStyleOptions,
    BigCommerceBuyNowInitializeOptions,
    StyleButtonColor,
} from '../big-commerce-types';

import BigCommerceVenmoButtonInitializeOptions, {
    WithBigCommerceVenmoButtonInitializeOptions,
} from './big-commerce-venmo-button-initialize-options';

export default class BigCommerceVenmoButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommerceIntegrationService: BigCommerceIntegrationService,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithBigCommerceVenmoButtonInitializeOptions,
    ): Promise<void> {
        const { bigcommerce_payments_venmo, containerId, methodId } = options;
        const { buyNowInitializeOptions, currencyCode: providedCurrencyCode } =
            bigcommerce_payments_venmo || {};

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

        if (!bigcommerce_payments_venmo) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_payments_venmo" argument is not provided.`,
            );
        }

        if (isBuyNowFlow && !providedCurrencyCode) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_payments_venmo.currencyCode" argument is not provided.`,
            );
        }

        if (
            isBuyNowFlow &&
            typeof buyNowInitializeOptions?.getBuyNowCartRequestBody !== 'function'
        ) {
            throw new InvalidArgumentError(
                `Unable to initialize payment because "options.bigcommerce_payments_venmo.buyNowInitializeOptions.getBuyNowCartRequestBody" argument is not provided or it is not a function.`,
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

        this.renderButton(containerId, methodId, bigcommerce_payments_venmo);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        bigcommerce_payments_venmo: BigCommerceVenmoButtonInitializeOptions,
    ): void {
        const { buyNowInitializeOptions, style, onEligibilityFailure } = bigcommerce_payments_venmo;

        const paypalSdk = this.bigCommerceIntegrationService.getBigCommerceSdkOrThrow();
        const fundingSource = paypalSdk.FUNDING.VENMO;

        const defaultCallbacks = {
            createOrder: () =>
                this.bigCommerceIntegrationService.createOrder('bigcommerce_payments_venmo'),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.bigCommerceIntegrationService.tokenizePayment(methodId, orderID),
        };

        const buyNowFlowCallbacks = {
            onClick: () => this.handleClick(buyNowInitializeOptions),
            onCancel: () => this.paymentIntegrationService.loadDefaultCheckout(),
        };

        const buttonRenderOptions: BigCommerceButtonsOptions = {
            fundingSource,
            style: this.getValidVenmoButtonStyles(style),
            ...defaultCallbacks,
            ...(buyNowInitializeOptions && buyNowFlowCallbacks),
        };

        const paypalButtonRender = paypalSdk.Buttons(buttonRenderOptions);

        if (paypalButtonRender.isEligible()) {
            paypalButtonRender.render(`#${containerId}`);
        } else if (onEligibilityFailure && typeof onEligibilityFailure === 'function') {
            onEligibilityFailure();
        } else {
            this.bigCommerceIntegrationService.removeElement(containerId);
        }
    }

    private getValidVenmoButtonStyles(style: BigCommerceButtonStyleOptions | undefined) {
        const validButtonStyle = this.bigCommerceIntegrationService.getValidButtonStyle(style);

        if (validButtonStyle.color === StyleButtonColor.gold) {
            return {
                ...validButtonStyle,
                color: undefined,
            };
        }

        return validButtonStyle;
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
