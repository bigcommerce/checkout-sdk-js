import { CheckoutActionCreator, CheckoutStore } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { bindDecorator as bind } from '../../../common/utility';
import { getCallbackUrl, Masterpass, MasterpassCheckoutOptions, MasterpassScriptLoader } from '../../../payment/strategies/masterpass';
import { CheckoutButtonInitializeOptions } from '../../checkout-button-options';
import CheckoutButtonStrategy from '../checkout-button-strategy';

export default class MasterpassButtonStrategy implements CheckoutButtonStrategy {
    private _masterpassClient?: Masterpass;
    private _methodId?: string;
    private _signInButton?: HTMLElement;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _masterpassScriptLoader: MasterpassScriptLoader
    ) {}

    initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { containerId, methodId } = options;

        if (!containerId || !methodId) {
            throw new InvalidArgumentError('Unable to proceed because "containerId" argument is not provided.');
        }

        this._methodId = methodId;

        return this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout())
            .then(state => {
                const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);
                const storeConfig = state.config.getStoreConfig();

                if (!paymentMethod || !paymentMethod.initializationData.checkoutId) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                if (!storeConfig) {
                    throw new InvalidArgumentError('Unable to retrieve store configuration');
                }

                return this._masterpassScriptLoader.load(paymentMethod.config.testMode, storeConfig.storeProfile.storeLanguage, paymentMethod.initializationData.checkoutId);
            })
            .then(masterpass => {
                this._masterpassClient = masterpass;
                this._signInButton = this._createSignInButton(containerId);
            });
    }

    deinitialize(): Promise<void> {
        if (this._signInButton && this._signInButton.parentNode) {
            this._signInButton.removeEventListener('click', this._handleWalletButtonClick);
            this._signInButton.parentNode.removeChild(this._signInButton);
            this._signInButton = undefined;
        }

        return Promise.resolve();
    }

    private _createSignInButton(containerId: string): HTMLElement {
        const buttonContainer = document.getElementById(containerId);
        const state = this._store.getState();
        const paymentMethod = this._methodId ? state.paymentMethods.getPaymentMethod(this._methodId) : null;
        const storeConfig = state.config.getStoreConfig();

        if (!buttonContainer) {
            throw new Error('Need a container to place the button');
        }

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!storeConfig) {
            throw new InvalidArgumentError('Unable to retrieve store configuration');
        }

        const button = document.createElement('input');

        button.type = 'image';
        button.src = `https://${paymentMethod.config.testMode ? 'sandbox.' : ''}src.mastercard.com/assets/img/btn/src_chk_btn_126x030px.svg?locale=${storeConfig.storeProfile.storeLanguage}&paymentmethod=master,visa,amex,discover&checkoutid=${paymentMethod.initializationData.checkoutId}`;
        buttonContainer.appendChild(button);

        button.addEventListener('click', this._handleWalletButtonClick);

        return button;
    }

    private _createMasterpassPayload(): MasterpassCheckoutOptions {
        const state = this._store.getState();
        const checkout = state.checkout.getCheckout();
        const paymentMethod = this._methodId ? state.paymentMethods.getPaymentMethod(this._methodId) : null;

        if (!checkout) {
            throw new MissingDataError(MissingDataErrorType.MissingCheckout);
        }

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return {
            checkoutId: paymentMethod.initializationData.checkoutId,
            allowedCardTypes: paymentMethod.initializationData.allowedCardTypes,
            amount: checkout.cart.cartAmount.toString(),
            currency: checkout.cart.currency.code,
            cartId: checkout.cart.id,
            callbackUrl: getCallbackUrl('cart'),
        };
    }

    @bind
    private _handleWalletButtonClick(): void {
        if (!this._masterpassClient) {
            throw new NotInitializedError(NotInitializedErrorType.CheckoutButtonNotInitialized);
        }

        this._masterpassClient.checkout(this._createMasterpassPayload());
    }
}
