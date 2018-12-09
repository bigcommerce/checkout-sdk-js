import { CheckoutStore, InternalCheckoutSelectors} from '../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotImplementedError, NotInitializedError, NotInitializedErrorType, StandardError } from '../../common/error/errors';
import { PaymentMethod, PaymentMethodActionCreator } from '../../payment';
import { AmazonPayLoginButton, AmazonPayScriptLoader, AmazonPayWidgetError, AmazonPayWindow } from '../../payment/strategies/amazon-pay';
import { RemoteCheckoutActionCreator, RemoteCheckoutRequestSender } from '../../remote-checkout';
import CustomerCredentials from '../customer-credentials';
import { CustomerInitializeOptions, CustomerRequestOptions } from '../customer-request-options';

import CustomerStrategy from './customer-strategy';

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

    deinitialize(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        this._paymentMethod = undefined;

        return Promise.resolve(this._store.getState());
    }

    signIn(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
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

/**
 * A set of options that are required to initialize the customer step of
 * checkout to support Amazon Pay.
 *
 * When AmazonPay is initialized, a sign-in button will be inserted into the
 * DOM. When the customer clicks on it, they will be redirected to Amazon to
 * sign in.
 */
export interface AmazonPayCustomerInitializeOptions {
    /**
     * The ID of a container which the sign-in button should insert into.
     */
    container: string;

    /**
     * The colour of the sign-in button.
     */
    color?: 'Gold' | 'LightGray' | 'DarkGray';

    /**
     * The size of the sign-in button.
     */
    size?: 'small' | 'medium' | 'large' | 'x-large';

    /**
     * A callback that gets called if unable to initialize the widget or select
     * one of the address options provided by the widget.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: AmazonPayWidgetError | StandardError): void;
}

interface AuthorizationOptions {
    redirectUrl: string;
    tokenPrefix: string;
}
