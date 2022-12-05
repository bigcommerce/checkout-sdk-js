import { FormPoster } from '@bigcommerce/form-poster';
import { RequestSender, Response } from '@bigcommerce/request-sender';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotImplementedError,
    NotInitializedError,
    NotInitializedErrorType,
} from '../../../common/error/errors';
import { SDK_VERSION_HEADERS } from '../../../common/http-request';
import { PaymentMethod, PaymentMethodActionCreator } from '../../../payment';
import { ChasePayScriptLoader, ChasePaySuccessPayload } from '../../../payment/strategies/chasepay';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import {
    CustomerInitializeOptions,
    CustomerRequestOptions,
    ExecutePaymentMethodCheckoutOptions,
} from '../../customer-request-options';
import CustomerStrategy from '../customer-strategy';

export default class ChasePayCustomerStrategy implements CustomerStrategy {
    private _paymentMethod?: PaymentMethod;

    constructor(
        private _store: CheckoutStore,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _chasePayScriptLoader: ChasePayScriptLoader,
        private _requestSender: RequestSender,
        private _formPoster: FormPoster,
    ) {}

    initialize(options: CustomerInitializeOptions): Promise<InternalCheckoutSelectors> {
        const { chasepay: chasePayOptions, methodId } = options;

        if (!chasePayOptions || !methodId) {
            throw new InvalidArgumentError(
                'Unable to proceed because "options.chasepay" argument is not provided.',
            );
        }

        return this._store
            .dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId))
            .then((state) => {
                this._paymentMethod = state.paymentMethods.getPaymentMethod(methodId);

                const cart = state.cart.getCart();
                const storeConfig = state.config.getStoreConfig();

                if (!cart) {
                    throw new MissingDataError(MissingDataErrorType.MissingCart);
                }

                if (!storeConfig) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                if (
                    !this._paymentMethod ||
                    !this._paymentMethod.initializationData.digitalSessionId
                ) {
                    throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
                }

                const { container } = chasePayOptions;

                return this._chasePayScriptLoader
                    .load(this._paymentMethod.config.testMode)
                    .then((JPMC) => {
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
                            this._store
                                .dispatch(
                                    this._paymentMethodActionCreator.loadPaymentMethod(methodId),
                                )
                                .then(() => {
                                    const state = this._store.getState();
                                    const method = state.paymentMethods.getPaymentMethod(methodId);
                                    const sessionId =
                                        method &&
                                        method.initializationData &&
                                        method.initializationData.digitalSessionId;

                                    if (sessionId) {
                                        ChasePay.startCheckout(sessionId);
                                    }
                                });
                        });

                        ChasePay.on(
                            ChasePay.EventType.COMPLETE_CHECKOUT,
                            (payload: ChasePaySuccessPayload) => {
                                const state = this._store.getState();
                                const method = state.paymentMethods.getPaymentMethod(methodId);
                                const requestId =
                                    method &&
                                    method.initializationData &&
                                    method.initializationData.merchantRequestId;

                                if (requestId) {
                                    this._setExternalCheckoutData(payload, requestId).then(() => {
                                        this._reloadPage();
                                    });
                                }
                            },
                        );
                    });
            })
            .then(() => this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    signIn(): Promise<InternalCheckoutSelectors> {
        throw new NotImplementedError(
            'In order to sign in via Chase Pay®, the shopper must click on "Chase Pay®" button.',
        );
    }

    signOut(options?: CustomerRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const payment = state.payment.getPaymentId();

        if (!payment) {
            return Promise.resolve(this._store.getState());
        }

        return this._store.dispatch(
            this._remoteCheckoutActionCreator.signOut(payment.providerId, options),
        );
    }

    executePaymentMethodCheckout(
        options?: ExecutePaymentMethodCheckoutOptions,
    ): Promise<InternalCheckoutSelectors> {
        options?.continueWithCheckoutCallback?.();

        return Promise.resolve(this._store.getState());
    }

    private _setExternalCheckoutData(
        payload: ChasePaySuccessPayload,
        requestId: string,
    ): Promise<Response<any>> {
        const url = `checkout.php?provider=chasepay&action=set_external_checkout`;
        const options = {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                ...SDK_VERSION_HEADERS,
            },
            body: {
                sessionToken: payload.sessionToken,
                merchantRequestId: requestId,
            },
            method: 'post',
        };

        return this._requestSender.sendRequest(url, options);
    }

    private _reloadPage() {
        this._formPoster.postForm('/checkout.php', {
            headers: {
                Accept: 'text/html',
                'Content-Type': 'application/x-www-form-urlencoded',
                ...SDK_VERSION_HEADERS,
            },
            params: {
                fromChasePay: true,
            },
        });
    }
}
