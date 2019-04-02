import { RequestSender, Response } from '@bigcommerce/request-sender';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import {
    InvalidArgumentError,
    MissingDataError,
    MissingDataErrorType,
    NotInitializedError,
    NotInitializedErrorType,
} from '../../../common/error/errors';
import { ContentType, INTERNAL_USE_ONLY } from '../../../common/http-request';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { PaymentMethodCancelledError, PaymentMethodDeclinedError, PaymentMethodInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { Zip, ZipModalEvent } from './zip';
import ZipScriptLoader from './zip-script-loader';

export default class ZipPaymentStrategy implements PaymentStrategy {
    private _paymentMethod?: PaymentMethod;
    private _zipClient?: Zip;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _zipScriptLoader: ZipScriptLoader,
        private _requestSender: RequestSender
    ) { }

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        return this._zipScriptLoader.load()
            .then(zip => {
                this._zipClient = zip;

                return this._store.getState();
            });
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        this._paymentMethod = undefined;
        this._zipClient = undefined;

        return Promise.resolve(this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const { _zipClient: zipClient } = this;
        const useStoreCredit = !!payload.useStoreCredit;

        if (!payment) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment" argument is not provided.');
        }

        if (!zipClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() => this._store.dispatch(
                this._remoteCheckoutActionCreator.initializePayment(payment.methodId, { useStoreCredit })
            ))
            .then(()  => {
                return this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(payment.methodId, options))
                    .then(state => {
                        this._paymentMethod = state.paymentMethods.getPaymentMethod(payment.methodId);

                        if (!this._paymentMethod || !this._paymentMethod.clientToken) {
                            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                        }
                    })
                    .then(() => new Promise<string | undefined>((resolve, reject) => {
                        zipClient.Checkout.init({
                            onComplete: ({ checkoutId, state }) => {
                                if (state === ZipModalEvent.CancelCheckout) {
                                    return reject(new PaymentMethodCancelledError());
                                }

                                if (state === ZipModalEvent.CheckoutReferred && checkoutId) {
                                    return this._prepareForReferredRegistration(payment.methodId, checkoutId)
                                        .then(() => resolve());
                                }

                                if (state === ZipModalEvent.CheckoutApproved && checkoutId) {
                                    return resolve(checkoutId);
                                }

                                if (state === ZipModalEvent.CheckoutDeclined) {
                                    return reject(new PaymentMethodDeclinedError('Unfortunately your application was declined. Please select another payment method.'));
                                }

                                reject(new PaymentMethodInvalidError());
                            },
                            onCheckout: openModal => {
                                if (!this._paymentMethod || !this._paymentMethod.clientToken) {
                                    throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
                                }

                                openModal(JSON.parse(this._paymentMethod.clientToken));
                            },
                        });
                    })
                    .then(nonce => {
                        if (nonce !== undefined) {
                            return this._store.dispatch(this._paymentActionCreator.submitPayment({
                                methodId: payment.methodId,
                                paymentData: { nonce },
                            }));
                        }

                        return this._store.getState();
                    }
                    ));
            });
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private _prepareForReferredRegistration(provider: string, externalId: string): Promise<Response> {
        const url = `/api/storefront/payment/${provider}/save-external-id`;
        const options = {
            headers: {
                Accept: ContentType.JsonV1,
                'X-API-INTERNAL': INTERNAL_USE_ONLY,
            },
            body: {
                externalId,
                provider,
            },
        };

        return this._requestSender.post(url, options);
    }
}
