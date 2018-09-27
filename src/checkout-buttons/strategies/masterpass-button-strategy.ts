import { CheckoutButtonInitializeOptions, CheckoutButtonOptions } from '../';
import { CheckoutActionCreator, CheckoutStore } from '../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType
} from '../../common/error/errors';
import { bindDecorator as bind } from '../../common/utility';
import { Masterpass, MasterpassCheckoutOptions, MasterpassScriptLoader } from '../../payment/strategies/masterpass';

import { CheckoutButtonStrategy } from './';

export default class MasterpassButtonStrategy extends CheckoutButtonStrategy {
    private _masterpassClient?: Masterpass;
    private _methodId?: string;
    private _signInButton?: HTMLElement;

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _masterpassScriptLoader: MasterpassScriptLoader
    ) {
        super();
    }

    initialize(options: CheckoutButtonInitializeOptions): Promise<void> {
        const { masterpass: masterpassOptions, methodId } = options;

        if (!masterpassOptions || !methodId) {
            throw new InvalidArgumentError('Unable to proceed because "options.masterpass" argument is not provided.');
        }

        if (this._isInitialized) {
            return super.initialize(options);
        }

        this._methodId = methodId;

        return this._store.dispatch(this._checkoutActionCreator.loadDefaultCheckout())
            .then(state => {
                const paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                if (!paymentMethod || !paymentMethod.initializationData.checkoutId) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                }

                return this._masterpassScriptLoader.load(paymentMethod.config.testMode);
            })
            .then(masterpass => {
                this._masterpassClient = masterpass;
                this._signInButton = this._createSignInButton(masterpassOptions.container);

                return super.initialize(options);
            });
    }

    deinitialize(options: CheckoutButtonOptions): Promise<void> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        if (this._signInButton && this._signInButton.parentNode) {
            this._signInButton.removeEventListener('click', this._handleWalletButtonClick);
            this._signInButton.parentNode.removeChild(this._signInButton);
            this._signInButton = undefined;
        }

        return super.deinitialize(options);
    }

    private _createSignInButton(containerId: string): HTMLElement {
        const buttonContainer = document.querySelector(`#${containerId}`);

        if (!buttonContainer) {
            throw new Error('Need a container to place the button');
        }

        const button = document.createElement('input');

        button.type = 'image';
        button.src = 'https://static.masterpass.com/dyn/img/btn/global/mp_chk_btn_160x037px.svg';
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
            suppressShippingAddress: true,
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
