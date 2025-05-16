import {
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    InvalidArgumentError,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import BigCommercePaymentsIntegrationService from '../bigcommerce-payments-integration-service';
import {
    ApproveCallbackPayload,
    BigCommercePaymentsButtonsOptions,
    PayPalButtonStyleOptions,
    PayPalBuyNowInitializeOptions,
    StyleButtonColor,
} from '../bigcommerce-payments-types';

import BigCommercePaymentsVenmoButtonInitializeOptions, {
    WithBigCommercePaymentsVenmoButtonInitializeOptions,
} from './bigcommerce-payments-venmo-button-initialize-options';

export default class BigCommercePaymentsVenmoButtonStrategy implements CheckoutButtonStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private bigCommercePaymentsIntegrationService: BigCommercePaymentsIntegrationService,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions &
            WithBigCommercePaymentsVenmoButtonInitializeOptions,
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

        await this.bigCommercePaymentsIntegrationService.loadPayPalSdk(
            methodId,
            currencyCode,
            false,
        );

        this.renderButton(containerId, methodId, bigcommerce_payments_venmo);
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private renderButton(
        containerId: string,
        methodId: string,
        bigcommerce_payments_venmo: BigCommercePaymentsVenmoButtonInitializeOptions,
    ): void {
        const { buyNowInitializeOptions, style, onEligibilityFailure } = bigcommerce_payments_venmo;

        const paypalSdk = this.bigCommercePaymentsIntegrationService.getPayPalSdkOrThrow();
        const fundingSource = paypalSdk.FUNDING.VENMO;

        const defaultCallbacks = {
            createOrder: () =>
                this.bigCommercePaymentsIntegrationService.createOrder(
                    'bigcommerce_payments_venmo',
                ),
            onApprove: ({ orderID }: ApproveCallbackPayload) =>
                this.bigCommercePaymentsIntegrationService.tokenizePayment(methodId, orderID),
        };

        const buyNowFlowCallbacks = {
            onClick: () => this.handleClick(buyNowInitializeOptions),
            onCancel: () => this.paymentIntegrationService.loadDefaultCheckout(),
        };

        const buttonRenderOptions: BigCommercePaymentsButtonsOptions = {
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
            this.bigCommercePaymentsIntegrationService.removeElement(containerId);
        }
    }

    private getValidVenmoButtonStyles(style: PayPalButtonStyleOptions | undefined) {
        const validButtonStyle =
            this.bigCommercePaymentsIntegrationService.getValidButtonStyle(style);

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
            const buyNowCart =
                await this.bigCommercePaymentsIntegrationService.createBuyNowCartOrThrow(
                    buyNowInitializeOptions,
                );

            await this.paymentIntegrationService.loadCheckout(buyNowCart.id);
        }
    }
}
