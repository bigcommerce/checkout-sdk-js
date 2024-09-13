import {
    AmazonPayV2CheckoutSessionConfig,
    AmazonPayV2InitializeOptions,
    AmazonPayV2PaymentProcessor,
    AmazonPayV2PayOptions,
    AmazonPayV2Placement,
} from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import {
    BuyNowCartCreationError,
    CheckoutButtonInitializeOptions,
    CheckoutButtonStrategy,
    getShippableItemsCount,
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    PaymentIntegrationService,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    WithAmazonPayV2ButtonInitializeOptions,
    WithBuyNowFeature,
} from './amazon-pay-v2-button-options';
import AmazonPayV2RequestSender from './amazon-pay-v2-request-sender';
import AmazonPayV2ConfigCreationError from './errors/amazon-pay-v2-config-creation-error';
import { isWithBuyNowFeatures } from './isWithBuyNowFeatures';

export default class AmazonPayV2ButtonStrategy implements CheckoutButtonStrategy {
    private _buyNowInitializeOptions: WithBuyNowFeature['buyNowInitializeOptions'];

    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor,
        private amazonPayV2ConfigRequestSender: AmazonPayV2RequestSender,
    ) {}

    async initialize(
        options: CheckoutButtonInitializeOptions & WithAmazonPayV2ButtonInitializeOptions,
    ): Promise<void> {
        const { methodId, containerId, amazonpay } = options;
        const { buttonColor } = amazonpay || {};

        if (!methodId || !containerId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" or "containerId" argument is not provided.',
            );
        }

        const { getPaymentMethodOrThrow } = this.paymentIntegrationService.getState();

        const paymentMethod = getPaymentMethodOrThrow<AmazonPayV2InitializeOptions>(methodId);
        const { initializationData } = paymentMethod;

        await this.amazonPayV2PaymentProcessor.initialize(paymentMethod);

        if (!amazonpay) {
            await this.paymentIntegrationService.loadDefaultCheckout();
        }

        const initializeAmazonButtonOptions = isWithBuyNowFeatures(amazonpay)
            ? undefined
            : amazonpay;

        if (
            isWithBuyNowFeatures(amazonpay) &&
            typeof amazonpay.buyNowInitializeOptions?.getBuyNowCartRequestBody === 'function'
        ) {
            this._buyNowInitializeOptions = amazonpay.buyNowInitializeOptions;
            this.amazonPayV2PaymentProcessor.updateBuyNowFlowFlag(true);
        }

        this.amazonPayV2PaymentProcessor.renderAmazonPayButton({
            checkoutState: this.paymentIntegrationService.getState(),
            containerId,
            methodId,
            options: initializeAmazonButtonOptions,
            placement: AmazonPayV2Placement.Cart,
            buttonColor,
            isButtonMicroTextDisabled: initializationData?.isButtonMicroTextDisabled,
        });

        if (this._buyNowInitializeOptions) {
            this.amazonPayV2PaymentProcessor.prepareCheckoutWithCreationRequestConfig(
                this._getCheckoutCreationRequestConfig.bind(this),
            );
        }
    }

    deinitialize(): Promise<void> {
        return this.amazonPayV2PaymentProcessor.deinitialize();
    }

    private async _createBuyNowCartOrThrow() {
        const buyNowCartRequestBody = this._buyNowInitializeOptions?.getBuyNowCartRequestBody?.();

        if (!buyNowCartRequestBody) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }

        try {
            const buyNowCart = await this.paymentIntegrationService.createBuyNowCart(
                buyNowCartRequestBody,
            );

            return buyNowCart;
        } catch (error) {
            throw new BuyNowCartCreationError();
        }
    }

    private async _createCheckoutConfig(
        id: string,
    ): Promise<Required<AmazonPayV2CheckoutSessionConfig>> {
        try {
            const {
                body: { payload, public_key, ...rest },
            } = await this.amazonPayV2ConfigRequestSender.createCheckoutConfig(id);

            return {
                payloadJSON: payload,
                publicKeyId: public_key,
                ...rest,
            };
        } catch (error) {
            throw new AmazonPayV2ConfigCreationError();
        }
    }

    private async _getCheckoutCreationRequestConfig() {
        const buyNowCart = await this._createBuyNowCartOrThrow();
        const estimatedOrderAmount = {
            amount: String(buyNowCart.baseAmount),
            currencyCode: buyNowCart.currency.code,
        };
        const createCheckoutSessionConfig = await this._createCheckoutConfig(buyNowCart.id);

        return {
            createCheckoutSessionConfig,
            estimatedOrderAmount,
            productType:
                getShippableItemsCount(buyNowCart) === 0
                    ? AmazonPayV2PayOptions.PayOnly
                    : AmazonPayV2PayOptions.PayAndShip,
        };
    }
}
