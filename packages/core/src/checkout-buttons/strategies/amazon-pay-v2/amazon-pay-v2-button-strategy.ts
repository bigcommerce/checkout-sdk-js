import { CartRequestSender } from '../../../cart';
import { BuyNowCartCreationError } from '../../../cart/errors';
import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
} from '../../../common/error/errors';
import {
    AmazonPayV2CheckoutSessionConfig,
    AmazonPayV2PaymentProcessor,
    AmazonPayV2PayOptions,
    AmazonPayV2Placement,
} from '../../../payment/strategies/amazon-pay-v2';
import { getShippableItemsCount } from '../../../shipping';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import { isWithBuyNowFeatures, WithBuyNowFeature } from './amazon-pay-v2-button-options';
import AmazonPayV2RequestSender from './amazon-pay-v2-request-sender';
import AmazonPayV2ConfigCreationError from './errors/amazon-pay-v2-config-creation-error';

export default class AmazonPayV2ButtonStrategy implements CheckoutButtonStrategy {
    private _buyNowInitializeOptions: WithBuyNowFeature['buyNowInitializeOptions'];

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor,
        private _cartRequestSender: CartRequestSender,
        private _amazonPayV2ConfigRequestSender: AmazonPayV2RequestSender,
    ) {}

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { methodId, containerId, amazonpay } = options;
        const { buttonColor } = amazonpay || {};

        if (!methodId || !containerId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "methodId" or "containerId" argument is not provided.',
            );
        }

        const {
            paymentMethods: { getPaymentMethodOrThrow },
        } = this._store.getState();

        await this._amazonPayV2PaymentProcessor.initialize(getPaymentMethodOrThrow(methodId));

        if (!amazonpay) {
            await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        }

        const initializeAmazonButtonOptions = isWithBuyNowFeatures(amazonpay)
            ? undefined
            : amazonpay;

        if (
            isWithBuyNowFeatures(amazonpay) &&
            typeof amazonpay?.buyNowInitializeOptions?.getBuyNowCartRequestBody === 'function'
        ) {
            this._buyNowInitializeOptions = amazonpay.buyNowInitializeOptions;

            if (this._buyNowInitializeOptions) {
                this._amazonPayV2PaymentProcessor.updateBuyNowFlowFlag(true);
            }
        }

        this._amazonPayV2PaymentProcessor.renderAmazonPayButton({
            checkoutState: this._store.getState(),
            containerId,
            methodId,
            options: initializeAmazonButtonOptions,
            placement: AmazonPayV2Placement.Cart,
            buttonColor,
        });

        if (this._buyNowInitializeOptions) {
            this._amazonPayV2PaymentProcessor.prepareCheckoutWithCreationRequestConfig(
                this._getCheckoutCreationRequestConfig.bind(this),
            );
        }
    }

    deinitialize(): Promise<void> {
        return this._amazonPayV2PaymentProcessor.deinitialize();
    }

    private async _createBuyNowCart() {
        const buyNowCartRequestBody = this._buyNowInitializeOptions?.getBuyNowCartRequestBody?.();

        if (!buyNowCartRequestBody) {
            throw new MissingDataError(MissingDataErrorType.MissingCart);
        }

        try {
            const { body: buyNowCart } = await this._cartRequestSender.createBuyNowCart(
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
            } = await this._amazonPayV2ConfigRequestSender.createCheckoutConfig(id);

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
        const buyNowCart = await this._createBuyNowCart();

        if (buyNowCart) {
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
}
