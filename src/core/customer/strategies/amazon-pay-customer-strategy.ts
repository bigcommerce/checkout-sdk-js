/// <reference path="../../remote-checkout/methods/amazon-pay/amazon-login.d.ts" />
/// <reference path="../../remote-checkout/methods/amazon-pay/off-amazon-payments.d.ts" />

import { noop } from 'lodash';
import { AmazonPayScriptLoader } from '../../remote-checkout/methods/amazon-pay';
import { CheckoutSelectors } from '../../checkout';
import { NotInitializedError, NotImplementedError } from '../../common/error/errors';
import { PaymentMethod } from '../../payment';
import { ReadableDataStore } from '../../../data-store';
import { RemoteCheckoutCustomerError } from '../../remote-checkout/errors';
import { RemoteCheckoutRequestSender } from '../../remote-checkout';
import CustomerCredentials from '../customer-credentials';
import CustomerStrategy from './customer-strategy';
import SignInCustomerService from '../sign-in-customer-service';

export default class AmazonPayCustomerStrategy extends CustomerStrategy {
    private _paymentMethod?: PaymentMethod;
    private _signInButton?: OffAmazonPayments.Button;
    private _window: OffAmazonPayments.HostWindow;

    constructor(
        store: ReadableDataStore<CheckoutSelectors>,
        signInCustomerService: SignInCustomerService,
        private _requestSender: RemoteCheckoutRequestSender,
        private _scriptLoader: AmazonPayScriptLoader
    ) {
        super(store, signInCustomerService);

        this._window = window;
    }

    initialize(options: InitializeOptions): Promise<CheckoutSelectors> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        return this._signInCustomerService
            .initializeCustomer(options.paymentMethod.id, () =>
                new Promise((resolve, reject) => {
                    const { onError = noop } = options;

                    this._paymentMethod = options.paymentMethod;

                    this._window.onAmazonPaymentsReady = () => {
                        this._signInButton = this._createSignInButton({
                            ...options as InitializeWidgetOptions,
                            onError: (error) => {
                                reject(error);
                                onError(error);
                            },
                        });

                        resolve();
                    };

                    this._scriptLoader.loadWidget(this._paymentMethod)
                        .catch(reject);
                })
            )
            .then(() => super.initialize(options));
    }

    deinitialize(options?: any): Promise<CheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        this._signInButton = undefined;
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
        const { remote = {} } = checkout.getCustomer() || {};

        if (!remote.provider) {
            return Promise.resolve(this._store.getState());
        }

        return this._signInCustomerService.remoteSignOut(remote.provider, options);
    }

    private _createSignInButton(options: InitializeWidgetOptions): OffAmazonPayments.Button {
        if (!this._paymentMethod) {
            throw new NotInitializedError();
        }

        const { onError = noop } = options;
        const { config, initializationData } = this._paymentMethod;

        return new OffAmazonPayments.Button(options.container, config.merchantId!, {
            color: options.color || 'Gold',
            size: options.size || 'small',
            type: 'PwA',
            useAmazonAddressBook: true,
            authorization: () => {
                this._handleAuthorization(initializationData);
            },
            onError: (error) => {
                this._handleError(error, onError);
            },
        });
    }

    private _handleAuthorization(options: AuthorizationOptions): void {
        this._requestSender.generateToken()
            .then(({ body }) => {
                amazon.Login.authorize({
                    popup: false,
                    scope: 'payments:shipping_address payments:billing_address payments:widget profile',
                    state: `${options.tokenPrefix}${body.token}`,
                }, options.redirectUrl);

                this._requestSender.trackAuthorizationEvent();
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
    paymentMethod: PaymentMethod;
}

interface InitializeWidgetOptions {
    container: string;
    color?: string;
    size?: string;
    onError?: (error: Error) => void;
}

interface AuthorizationOptions {
    redirectUrl: string;
    tokenPrefix: string;
}
