import { FormPoster } from '@bigcommerce/form-poster';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotImplementedError } from '../../../common/error/errors';
import { bindDecorator as bind } from '../../../common/utility';
import { GooglePayPaymentProcessor } from '../../../payment/strategies/googlepay';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { CustomerInitializeOptions, CustomerRequestOptions } from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

import GooglePayCustomerInitializeOptions from './googlepay-customer-initialize-options';

export default class GooglePayCustomerStrategy implements CustomerStrategy {
    private _walletButton?: HTMLElement;

    constructor(
        private _store: CheckoutStore,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _googlePayPaymentProcessor: GooglePayPaymentProcessor,
        private _formPoster: FormPoster
    ) {}

    initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId }  = options;

        const googlePayOptions = this._getGooglePayOptions(options);

        if (!methodId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._googlePayPaymentProcessor.initialize(methodId)
            .then(() => {
                this._walletButton = this._createSignInButton(googlePayOptions.container);
            })
            .then(() => this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._walletButton && this._walletButton.parentNode) {
            this._walletButton.parentNode.removeChild(this._walletButton);
            this._walletButton = undefined;
        }

        return this._googlePayPaymentProcessor.deinitialize()
            .then(() => this._store.getState());
    }

    signIn(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via Google Pay, the shopper must click on "Google Pay" button.'
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const payment = state.payment.getPaymentId();

        if (!payment) {
            return Promise.resolve(this._store.getState());
        }

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.signOut(payment.providerId, options)
        );
    }

    private _createSignInButton(containerId: string): HTMLElement {
        const container = document.querySelector(`#${containerId}`);

        if (!container) {
            throw new InvalidArgumentError('Unable to create sign-in button without valid container ID.');
        }

        const button = this._googlePayPaymentProcessor.createButton(this._handleWalletButtonClick);

        container.appendChild(button);

        return button;
    }

    private _getGooglePayOptions(options: CustomerInitializeOptions): GooglePayCustomerInitializeOptions {
        if (options.methodId === 'googlepayadyenv2' && options.googlepayadyenv2) {
            return options.googlepayadyenv2;
        }

        if (options.methodId === 'googlepayauthorizenet' && options.googlepayauthorizenet) {
            return options.googlepayauthorizenet;
        }

        if (options.methodId === 'googlepaybraintree' && options.googlepaybraintree) {
            return options.googlepaybraintree;
        }

        if (options.methodId === 'googlepaycheckoutcom' && options.googlepaycheckoutcom) {
            return options.googlepaycheckoutcom;
        }

        if (options.methodId === 'googlepaystripe' && options.googlepaystripe) {
            return options.googlepaystripe;
        }

        throw new InvalidArgumentError();
    }

    @bind
    private async _handleWalletButtonClick(event: Event): Promise<void> {
        event.preventDefault();

        try {
            const paymentData = await this._googlePayPaymentProcessor.displayWallet();
            await this._googlePayPaymentProcessor.handleSuccess(paymentData);
            if (paymentData.shippingAddress) {
                await this._googlePayPaymentProcessor.updateShippingAddress(paymentData.shippingAddress);
            }
            await this._onPaymentSelectComplete();
        } catch (error) {
            if (error && error.message !== 'CANCELED') {
                throw error;
            }
        }
    }

    private _onPaymentSelectComplete(): void {
        this._formPoster.postForm('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    }
}
