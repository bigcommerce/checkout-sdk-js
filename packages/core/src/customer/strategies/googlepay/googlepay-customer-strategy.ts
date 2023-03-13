import { FormPoster } from '@bigcommerce/form-poster';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotImplementedError,
} from '../../../common/error/errors';
import { SDK_VERSION_HEADERS } from '../../../common/http-request';
import { bindDecorator as bind } from '../../../common/utility';
import { GooglePayPaymentProcessor } from '../../../payment/strategies/googlepay';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { getShippableItemsCount } from '../../../shipping';
import {
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
} from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

import GooglePayCustomerInitializeOptions from './googlepay-customer-initialize-options';
import { default as MethodType } from './googlepay-customer-method-type';

export default class GooglePayCustomerStrategy implements CustomerStrategy {
    private _walletButton?: HTMLElement;

    constructor(
        private _store: CheckoutStore,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _googlePayPaymentProcessor: GooglePayPaymentProcessor,
        private _formPoster: FormPoster,
    ) {}

    initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { methodId } = options;

        const googlePayOptions = this._getGooglePayOptions(options);

        if (!methodId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._googlePayPaymentProcessor
            .initialize(methodId)
            .then(() => {
                this._walletButton = this._createSignInButton(
                    googlePayOptions.container,
                    googlePayOptions,
                );
            })
            .then(() => this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        if (this._walletButton && this._walletButton.parentNode) {
            this._walletButton.parentNode.removeChild(this._walletButton);
            this._walletButton = undefined;
        }

        return this._googlePayPaymentProcessor.deinitialize().then(() => this._store.getState());
    }

    signIn(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via Google Pay, the shopper must click on "Google Pay" button.',
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const payment = state.payment.getPaymentId();

        if (!payment) {
            return Promise.resolve(this._store.getState());
        }

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.forgetCheckout(payment.providerId, options),
        );
    }

    executePaymentMethodCheckout(
        options?: ExecutePaymentMethodCheckoutOptions,
    ): Promise<InternalCheckoutSelectors> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve(this._store.getState());
    }

    private _createSignInButton(
        containerId: string,
        buttonOptions: GooglePayCustomerInitializeOptions,
    ): HTMLElement {
        const container = document.querySelector(`#${containerId}`);
        const { buttonType, buttonColor } = buttonOptions;

        if (!container) {
            throw new InvalidArgumentError(
                'Unable to create sign-in button without valid container ID.',
            );
        }

        const button = this._googlePayPaymentProcessor.createButton(
            this._handleWalletButtonClick,
            buttonType,
            buttonColor,
        );

        container.appendChild(button);

        return button;
    }

    private _getGooglePayOptions(
        options: CustomerInitializeOptions,
    ): GooglePayCustomerInitializeOptions {
        if (options.methodId === MethodType.GOOGLEPAY_ADYENV2 && options.googlepayadyenv2) {
            return options.googlepayadyenv2;
        }

        if (options.methodId === MethodType.GOOGLEPAY_ADYENV3 && options.googlepayadyenv3) {
            return options.googlepayadyenv3;
        }

        if (
            options.methodId === MethodType.GOOGLEPAY_AUTHORIZENET &&
            options.googlepayauthorizenet
        ) {
            return options.googlepayauthorizenet;
        }

        if (options.methodId === MethodType.GOOGLEPAY_BNZ && options.googlepaybnz) {
            return options.googlepaybnz;
        }

        if (options.methodId === MethodType.GOOGLEPAY_BRAINTREE && options.googlepaybraintree) {
            return options.googlepaybraintree;
        }

        if (options.methodId === MethodType.GOOGLEPAY_CHECKOUTCOM && options.googlepaycheckoutcom) {
            return options.googlepaycheckoutcom;
        }

        if (
            options.methodId === MethodType.GOOGLEPAY_CYBERSOURCEV2 &&
            options.googlepaycybersourcev2
        ) {
            return options.googlepaycybersourcev2;
        }

        if (options.methodId === MethodType.GOOGLEPAY_ORBITAL && options.googlepayorbital) {
            return options.googlepayorbital;
        }

        if (options.methodId === MethodType.GOOGLEPAY_STRIPE && options.googlepaystripe) {
            return options.googlepaystripe;
        }

        if (options.methodId === MethodType.GOOGLEPAY_STRIPEUPE && options.googlepaystripeupe) {
            return options.googlepaystripeupe;
        }
        if (
            options.methodId === MethodType.GOOGLEPAY_WORLDPAYACCESS &&
            options.googlepayworldpayaccess
        ) {
            return options.googlepayworldpayaccess;
        }

        throw new InvalidArgumentError();
    }

    @bind
    private async _handleWalletButtonClick(event: Event): Promise<void> {
        event.preventDefault();

        const cart = this._store.getState().cart.getCartOrThrow();
        const hasPhysicalItems = getShippableItemsCount(cart) > 0;

        const payloadToUpdate = {
            currencyCode: cart.currency.code,
            totalPrice: String(cart.cartAmount),
        };

        this._googlePayPaymentProcessor.updatePaymentDataRequest(payloadToUpdate);

        try {
            const paymentData = await this._googlePayPaymentProcessor.displayWallet();

            await this._googlePayPaymentProcessor.handleSuccess(paymentData);

            if (hasPhysicalItems && paymentData.shippingAddress) {
                await this._googlePayPaymentProcessor.updateShippingAddress(
                    paymentData.shippingAddress,
                );
            }

            await this._onPaymentSelectComplete();
        } catch (error) {
            if (error && error.message !== 'CANCELED') {
                throw error;
            }
        }
    }

    private _onPaymentSelectComplete(): void {
        const checkoutUrl = this._store.getState().config.getStoreConfigOrThrow().links.siteLink;

        this._formPoster.postForm(
            window.location.pathname === '/embedded-checkout'
                ? `${checkoutUrl}/checkout`
                : '/checkout.php',
            {
                headers: {
                    Accept: 'text/html',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    ...SDK_VERSION_HEADERS,
                },
            },
        );
    }
}
