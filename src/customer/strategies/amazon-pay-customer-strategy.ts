/// <reference path="../../remote-checkout/methods/amazon-pay/amazon-login.d.ts" />
/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments.d.ts" />

import 'rxjs/add/observable/empty';

import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { NotImplementedError, NotInitializedError } from '../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../payment';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import { RemoteCheckoutCustomerError } from '../../remote-checkout/errors';
import { AmazonPayScriptLoader } from '../../remote-checkout/methods/amazon-pay';
import CustomerCredentials from '../customer-credentials';

import CustomerStrategy from './customer-strategy';

export default class AmazonPayCustomerStrategy extends CustomerStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _remoteCheckoutRequestSender: RemoteCheckoutRequestSender,
        private _scriptLoader: AmazonPayScriptLoader
    ) {
        super(store);
    }

    initialize(options: InitializeOptions): Promise<CheckoutSelectors> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(options.methodId))
            .then(({ checkout }) => new Promise((resolve, reject) => {
                this._paymentMethod = checkout.getPaymentMethod(options.methodId);

                const { onError = () => {} } = options;
                const onReady = () => {
                    this._createSignInButton({
                        ...options as InitializeWidgetOptions,
                        onError: error => {
                            reject(error);
                            onError(error);
                        },
                    });

                    resolve();
                };

                this._scriptLoader.loadWidget(this._paymentMethod!, onReady)
                    .catch(reject);
            }))
            .then(() => super.initialize(options));
    }

    deinitialize(options?: any): Promise<CheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        this._paymentMethod = undefined;

        return super.deinitialize(options);
    }

    signIn(credentials: CustomerCredentials, options?: any): Promise<CheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via AmazonPay, the shopper must click on "Login with Amazon" button.'
        );
    }

    signOut(options?: any): Promise<CheckoutSelectors> {
        const { checkout } = this._store.getState();
        const { remote = { provider: undefined } } = checkout.getCustomer() || {};

        if (!remote.provider) {
            return Promise.resolve(this._store.getState());
        }

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.signOut(remote.provider, options)
        );
    }

    private _createSignInButton(options: InitializeWidgetOptions): OffAmazonPayments.Button {
        if (!this._paymentMethod) {
            throw new NotInitializedError();
        }

        const { onError = () => {} } = options;
        const { config, initializationData } = this._paymentMethod;

        return new OffAmazonPayments.Button(options.container, config.merchantId!, {
            color: options.color || 'Gold',
            size: options.size || 'small',
            type: 'PwA',
            useAmazonAddressBook: true,
            authorization: () => {
                this._handleAuthorization(initializationData);
            },
            onError: error => {
                this._handleError(error, onError);
            },
        });
    }

    private _handleAuthorization(options: AuthorizationOptions): void {
        this._remoteCheckoutRequestSender.generateToken()
            .then(({ body }) => {
                amazon.Login.authorize({
                    popup: false,
                    scope: 'payments:shipping_address payments:billing_address payments:widget profile',
                    state: `${options.tokenPrefix}${body.token}`,
                }, options.redirectUrl);

                this._remoteCheckoutRequestSender.trackAuthorizationEvent();
            });
    }

    private _handleError(error: OffAmazonPayments.Widgets.WidgetError, callback: (error: Error) => void): void {
        if (!error) {
            return;
        }

        callback(new RemoteCheckoutCustomerError(error));
    }
}

export interface InitializeOptions extends InitializeWidgetOptions {
    methodId: string;
}

export interface InitializeWidgetOptions {
    container: string;
    color?: string;
    size?: string;
    onError?: (error: Error) => void;
}

interface AuthorizationOptions {
    redirectUrl: string;
    tokenPrefix: string;
}
