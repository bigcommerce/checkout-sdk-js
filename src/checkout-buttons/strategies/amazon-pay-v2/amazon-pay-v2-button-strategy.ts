import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { AmazonPayV2PaymentProcessor, AmazonPayV2PayOptions, AmazonPayV2Placement } from '../../../payment/strategies/amazon-pay-v2';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class AmazonPayV2ButtonStrategy implements CheckoutButtonStrategy {
    private _walletButton?: HTMLElement;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _amazonPayV2PaymentProcessor: AmazonPayV2PaymentProcessor
    ) { }

    async initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { containerId, methodId } = options;

        if (!containerId || !methodId) {
            throw new InvalidArgumentError('Unable to proceed because "containerId" argument is not provided.');
        }

        await this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout());
        await this._amazonPayV2PaymentProcessor.initialize(methodId);

        this._walletButton = this._createSignInButton(containerId, methodId);
    }

    deinitialize(): Promise<void> {
        if (this._walletButton && this._walletButton.parentNode) {
            this._walletButton.parentNode.removeChild(this._walletButton);
            this._walletButton = undefined;
        }

        return Promise.resolve();
    }

    private _createSignInButton(containerId: string, methodId: string): HTMLElement {
        const container = document.getElementById(containerId);

        if (!container) {
            throw new InvalidArgumentError('Unable to create sign-in button without valid container ID.');
        }

        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
        const cart = state.cart.getCart();
        const config = state.config.getStoreConfig();

        if (!config) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
        }

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const {
            config: {
                merchantId,
                testMode,
            },
            initializationData: {
                checkoutLanguage,
                ledgerCurrency,
                checkoutSessionMethod,
                region,
                extractAmazonCheckoutSessionId,
            },
        } = paymentMethod;

        if (!merchantId) {
            throw new InvalidArgumentError();
        }

        const amazonButtonOptions = {
            merchantId,
            sandbox: !!testMode,
            checkoutLanguage,
            ledgerCurrency,
            region,
            productType: cart && cart.lineItems.physicalItems.length === 0 ?
                AmazonPayV2PayOptions.PayOnly :
                AmazonPayV2PayOptions.PayAndShip,
            createCheckoutSession: {
                method: checkoutSessionMethod,
                url: `${config.storeProfile.shopPath}/remote-checkout/${methodId}/payment-session`,
                extractAmazonCheckoutSessionId,
            },
            placement: AmazonPayV2Placement.Cart,
        };

        this._amazonPayV2PaymentProcessor.createButton(`#${containerId}`, amazonButtonOptions);

        return container;
    }
}
