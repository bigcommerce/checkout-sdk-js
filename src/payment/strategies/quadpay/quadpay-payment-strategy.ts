import { RequestSender, Response } from '@bigcommerce/request-sender';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { ContentType, INTERNAL_USE_ONLY } from '../../../common/http-request';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentMethodCancelledError, PaymentMethodDeclinedError, PaymentMethodInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import { Quadpay, QuadpayModalEvent } from './quadpay';
import QuadpayScriptLoader from './quadpay-script-loader';

export default class QuadpayPaymentStrategy implements PaymentStrategy {
    private _paymentMethod?: PaymentMethod;
    private _quadPayClient?: Quadpay;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _quadPayScriptLoader: QuadpayScriptLoader,
        private _requestSender: RequestSender
    ) { }

    async initialize(): Promise<InternalCheckoutSelectors> {
        const quadpay = await this._quadPayScriptLoader.load();
        this._quadPayClient = quadpay;

        return this._store.getState();
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._paymentMethod = undefined;
        this._quadPayClient = undefined;

        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const { _quadPayClient: quadPayClient } = this;

        if (!payment) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment" argument is not provided.');
        }

        if (!quadPayClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        const { isStoreCreditApplied: useStoreCredit } = this._store.getState().checkout.getCheckoutOrThrow();

        if (useStoreCredit !== undefined) {
            await this._store.dispatch(this._storeCreditActionCreator.applyStoreCredit(useStoreCredit));
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
        await this._store.dispatch(this._remoteCheckoutActionCreator.initializePayment(payment.methodId, { useStoreCredit }));

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(payment.methodId, options));

        this._paymentMethod = state.paymentMethods.getPaymentMethod(payment.methodId);

        if (!this._paymentMethod || !this._paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (this._redirectFlowIsTrue()) {
            let nonce: { id: string };
            try {
                nonce = JSON.parse(this._paymentMethod.clientToken);
            } catch (error) {
                throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
            }

            await this._prepareForReferredRegistration(payment.methodId, nonce.id);

            try {
                return await this._store.dispatch(this._paymentActionCreator.submitPayment({methodId: payment.methodId, paymentData: { nonce: nonce.id }}));
            } catch (error) {
                if (error instanceof RequestError && error.body.status === 'additional_action_required') {
                    return new Promise(() => {
                        const { redirect_url } = error.body.additional_action_required.data;
                        window.location.replace(redirect_url);
                    });
                }
                throw error;
            }
        }

        const nonce = await new Promise<string | undefined>((resolve, reject) => {
            quadPayClient.Checkout.init({
                onComplete: async ({ checkoutId, state }) => {
                    if (state === QuadpayModalEvent.CancelCheckout) {
                        return reject(new PaymentMethodCancelledError());
                    }

                    if (state === QuadpayModalEvent.CheckoutReferred && checkoutId) {
                        await this._prepareForReferredRegistration(payment.methodId, checkoutId);

                        if (this._paymentMethod?.initializationData?.deferredFlowV2Enabled) {
                            return resolve(checkoutId);
                        }

                        return resolve();
                    }

                    if (state === QuadpayModalEvent.CheckoutApproved && checkoutId) {
                        return resolve(checkoutId);
                    }

                    if (state === QuadpayModalEvent.CheckoutDeclined) {
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
        });

        if (nonce !== undefined) {
            return this._store.dispatch(this._paymentActionCreator.submitPayment({
                methodId: payment.methodId,
                paymentData: { nonce },
            }));
        }

        return this._store.getState();
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    private _redirectFlowIsTrue(): boolean {
        return this._paymentMethod?.initializationData?.redirectFlowV2Enabled;
    }

    private _prepareForReferredRegistration(provider: string, externalId: string): Promise<Response<any>> {
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
