import { FormPoster } from '@bigcommerce/form-poster';
import { RequestSender, Response } from '@bigcommerce/request-sender';

import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotImplementedError, NotInitializedError, NotInitializedErrorType } from '../../common/error/errors';
import { toFormUrlEncoded } from '../../common/http-request';
import { PaymentMethod, PaymentMethodActionCreator } from '../../payment';
import { ChasePayScriptLoader } from '../../payment/strategies/chasepay';
import { ChasePaySuccessPayload } from '../../payment/strategies/chasepay/chasepay';
import { RemoteCheckoutActionCreator } from '../../remote-checkout';
import CustomerCredentials from '../customer-credentials';
import {CustomerInitializeOptions, CustomerRequestOptions} from '../customer-request-options';

import CustomerStrategy from './customer-strategy';

export default class ChasePayCustomerStrategy extends CustomerStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _chasePayScriptLoader: ChasePayScriptLoader,
        private _requestSender: RequestSender,
        private _formPoster: FormPoster
    ) {
        super(store);
    }

    initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { chasepay: chasePayOptions, methodId } = options;

        if (!chasePayOptions || !methodId) {
            throw new InvalidArgumentError('Unable to proceed because "options.chasepay" argument is not provided.');
        }

        return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then(state => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                const cart = state.cart.getCart();
                const storeConfig = state.config.getStoreConfig();

                if (!cart) {
                    throw new MissingDataError(MissingDataErrorType.MissingCart);
                }

                if (!storeConfig) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                if (!this._paymentMethod || !this._paymentMethod.initializationData.digitalSessionId) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }

                const { container } = chasePayOptions;

                return this._chasePayScriptLoader.load(this._paymentMethod.config.testMode)
                    .then(JPMC => {
                        const ChasePay = JPMC.ChasePay;

                        ChasePay.configure({
                            language: storeConfig.storeProfile.storeLanguage,
                        });

                        if (ChasePay.isChasePayUp) {
                            ChasePay.insertButtons({
                                containers: [container],
                            });
                        }

                        ChasePay.on(ChasePay.EventType.START_CHECKOUT, () => {
                            this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
                                .then(() => {
                                    const state = this._store.getState();
                                    const method = state.paymentMethods.getPaymentMethod(methodId);
                                    const sessionId = method && method.initializationData && method.initializationData.digitalSessionId;

                                    if (sessionId) {
                                        ChasePay.startCheckout(sessionId);
                                    }
                                });
                        });

                        ChasePay.on(ChasePay.EventType.COMPLETE_CHECKOUT, (payload: ChasePaySuccessPayload) => {
                            const state = this._store.getState();
                            const method = state.paymentMethods.getPaymentMethod(methodId);
                            const requestId = method && method.initializationData && method.initializationData.merchantRequestId;

                            if (requestId) {
                                this._setExternalCheckoutData(payload, requestId)
                                    .then(() => {
                                        this._reloadPage();
                                });
                            }
                        });
                    });
            })
            .then(() => super.initialize(options));
    }

    signIn(credentials: CustomerCredentials, options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via Chase Pay®, the shopper must click on "Chase Pay®" button.'
        );
    }

    signOut(options?: any): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const payment = state.payment.getPaymentId();

        if (!payment) {
            return Promise.resolve(this._store.getState());
        }

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.signOut(payment.providerId, options)
        );
    }

    private _setExternalCheckoutData(payload: ChasePaySuccessPayload, requestId: string): Promise<Response> {
        const url = `checkout.php?provider=chasepay&action=set_external_checkout`;
        const options = {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            },
            body: toFormUrlEncoded({
                sessionToken: payload.sessionToken,
                merchantRequestId: requestId,
            }),
            method: 'post',
        };

        return this._requestSender.sendRequest(url, options);
    }

    private _reloadPage() {
        this._formPoster.postForm('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            params: {
                fromChasePay: true,
            },
        });
    }
}

export interface ChasePayCustomerInitializeOptions {
    container: string;
}
