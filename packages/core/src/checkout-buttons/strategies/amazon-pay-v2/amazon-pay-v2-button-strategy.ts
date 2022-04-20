import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { PaymentMethod } from '../../../payment';
import { AmazonPayV2ButtonParams, AmazonPayV2PaymentProcessor, AmazonPayV2PayOptions, AmazonPayV2Placement } from '../../../payment/strategies/amazon-pay-v2';
import { getShippableItemsCount } from '../../../shipping';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

import { AmazonPayV2ButtonInitializeOptions } from './amazon-pay-v2-button-options';

export default class AmazonPayV2ButtonStrategy implements CheckoutButtonStrategy {
    private _walletButton?: HTMLElement;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor
    ) { }

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { containerId, methodId, amazonpay } = options;

        if (!containerId || !methodId) {
            throw new InvalidArgumentError('Unable to proceed because "containerId" or "methodId" argument is not provided.');
        }

        const paymentMethod = this._store.getState().paymentMethods.getPaymentMethodOrThrow(methodId);

        await this._amazonPayV2PaymentProcessor.initialize(paymentMethod);
        this._walletButton = await this._createSignInButton(containerId, paymentMethod, amazonpay);
    }

    deinitialize(): Promise<void> {
        if (this._walletButton && this._walletButton.parentNode) {
            this._walletButton.parentNode.removeChild(this._walletButton);
            this._walletButton = undefined;
        }

        return Promise.resolve();
    }

    private async _createSignInButton(containerId: string, paymentMethod: PaymentMethod, options?: AmazonPayV2ButtonInitializeOptions): Promise<HTMLElement> {
        const container = document.getElementById(containerId);

        if (!container) {
            throw new InvalidArgumentError('Unable to create sign-in button without valid container ID.');
        }

        const amazonButtonOptions = options ?? await this._getAmazonPayV2ButtonOptions(paymentMethod);

        this._amazonPayV2PaymentProcessor.createButton(`#${containerId}`, amazonButtonOptions);

        return container;
    }

    private async _getAmazonPayV2ButtonOptions(paymentMethod: PaymentMethod): Promise<AmazonPayV2ButtonParams> {
        const state = await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        const cart = state.cart.getCart();
        const { storeProfile: { shopPath } } = state.config.getStoreConfigOrThrow();

        const {
            config: {
                merchantId,
                testMode,
            },
            initializationData: {
                checkoutLanguage,
                ledgerCurrency,
                checkoutSessionMethod,
                extractAmazonCheckoutSessionId,
            },
        } = paymentMethod;

        if (!merchantId || !ledgerCurrency || !shopPath) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return {
            merchantId,
            createCheckoutSession: {
                url: `${shopPath}/remote-checkout/${paymentMethod.id}/payment-session`,
                method: checkoutSessionMethod,
                extractAmazonCheckoutSessionId,
            },
            sandbox: !!testMode,
            ledgerCurrency,
            checkoutLanguage,
            productType: cart && getShippableItemsCount(cart) === 0 ?
                AmazonPayV2PayOptions.PayOnly :
                AmazonPayV2PayOptions.PayAndShip,
            placement: AmazonPayV2Placement.Cart,
        };
    }
}
