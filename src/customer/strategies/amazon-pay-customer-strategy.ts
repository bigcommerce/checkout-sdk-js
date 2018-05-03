import { CheckoutStore, InternalCheckoutSelectors} from '../../checkout';
import { InvalidArgumentError, MissingDataError, NotImplementedError, NotInitializedError, StandardError } from '../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../payment';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import { AmazonPayLoginButton, AmazonPayScriptLoader, AmazonPayWidgetError, AmazonPayWindow } from '../../remote-checkout/methods/amazon-pay';
import CustomerCredentials from '../customer-credentials';
import { CustomerInitializeOptions, CustomerRequestOptions } from '../customer-request-options';

import CustomerStrategy from './customer-strategy';

export default class AmazonPayCustomerStrategy extends CustomerStrategy {
    private _paymentMethod?: PaymentMethod;
    private _window: AmazonPayWindow;

    constructor(
        store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _remoteCheckoutRequestSender: RemoteCheckoutRequestSender,
        private _scriptLoader: AmazonPayScriptLoader
    ) {
        super(store);

        this._window = window;
    }

    initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (this._isInitialized) {
            return super.initialize(options);
        }

        const { amazon: amazonOptions, methodId } = options;

        if (!amazonOptions || !methodId) {
            throw new InvalidArgumentError('Unable to proceed because "options.amazon" argument is not provided.');
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => new Promise((resolve, reject) => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                if (!this._paymentMethod) {
                    throw new MissingDataError(`Unable to initialize because "paymentMethod (${methodId})" data is missing.`);
                }

                const { onError = () => {} } = amazonOptions;
                const onReady = () => {
                    this._createSignInButton({
                        ...amazonOptions,
                        onError: error => {
                            reject(error);
                            onError(error);
                        },
                    });

                    resolve();
                };

                this._scriptLoader.loadWidget(this._paymentMethod, onReady)
                    .catch(reject);
            }))
            .then(() => super.initialize(options));
    }

    deinitialize(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        if (!this._isInitialized) {
            return super.deinitialize(options);
        }

        this._paymentMethod = undefined;

        return super.deinitialize(options);
    }

    signIn(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via AmazonPay, the shopper must click on "Login with Amazon" button.'
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        const { customer } = this._store.getState();
        const { remote = { provider: undefined } } = customer.getCustomer() || {};

        if (!remote.provider) {
            return Promise.resolve(this._store.getState());
        }

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.signOut(remote.provider, options)
        );
    }

    private _createSignInButton(options: AmazonPayCustomerInitializeOptions): AmazonPayLoginButton {
        if (!this._paymentMethod || !this._paymentMethod.config.merchantId || !this._window.OffAmazonPayments) {
            throw new MissingDataError('Unable to create sign-in button because "paymentMethod.config.merchantId" field is missing.');
        }

        const { initializationData } = this._paymentMethod;

        return new this._window.OffAmazonPayments.Button(options.container, this._paymentMethod.config.merchantId, {
            color: options.color || 'Gold',
            size: options.size || 'small',
            type: 'PwA',
            useAmazonAddressBook: true,
            onError: options.onError,
            authorization: () => {
                this._handleAuthorization(initializationData);
            },
        });
    }

    private _handleAuthorization(options: AuthorizationOptions): void {
        this._remoteCheckoutRequestSender.generateToken()
            .then(({ body }) => {
                if (!this._window.amazon) {
                    throw new NotInitializedError();
                }

                this._window.amazon.Login.authorize({
                    popup: false,
                    scope: 'payments:shipping_address payments:billing_address payments:widget profile',
                    state: `${options.tokenPrefix}${body.token}`,
                }, options.redirectUrl);

                this._remoteCheckoutRequestSender.trackAuthorizationEvent();
            });
    }
}

export interface AmazonPayCustomerInitializeOptions {
    container: string;
    color?: string;
    size?: string;
    onError?(error: AmazonPayWidgetError | StandardError): void;
}

interface AuthorizationOptions {
    redirectUrl: string;
    tokenPrefix: string;
}
