import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotImplementedError, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { AmazonPayLoginButton, AmazonPayScriptLoader, AmazonPayWindow } from '../../../payment/strategies/amazon-pay';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../../remote-checkout';
import { CustomerInitializeOptions, CustomerRequestOptions } from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

import AmazonPayCustomerInitializeOptions from './amazon-pay-customer-initialize-options';

export default class AmazonPayCustomerStrategy implements CustomerStrategy {
    private _paymentMethod?: PaymentMethod;
    private _window: AmazonPayWindow;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _remoteCheckoutRequestSender: RemoteCheckoutRequestSender,
        private _scriptLoader: AmazonPayScriptLoader
    ) {
        this._window = window;
    }

    initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { amazon: amazonOptions, methodId } = options;

        if (!amazonOptions || !methodId) {
            throw new InvalidArgumentError('Unable to proceed because "options.amazon" argument is not provided.');
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => new Promise((resolve, reject) => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                if (!this._paymentMethod) {
                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
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
            .then(() => this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._paymentMethod = undefined;

        return Promise.resolve(this._store.getState());
    }

    signIn(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via AmazonPay, the shopper must click on "Login with Amazon" button.'
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

    private _createSignInButton(options: AmazonPayCustomerInitializeOptions): AmazonPayLoginButton {
        if (!this._paymentMethod || !this._window.OffAmazonPayments) {
            throw new NotInitializedError(NotInitializedErrorType.CustomerNotInitialized);
        }

        if (!this._paymentMethod.config.merchantId) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
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
                    throw new NotInitializedError(NotInitializedErrorType.ShippingNotInitialized);
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

interface AuthorizationOptions {
    redirectUrl: string;
    tokenPrefix: string;
}
