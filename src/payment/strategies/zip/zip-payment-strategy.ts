import { RequestSender, Response } from '@bigcommerce/request-sender';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, MissingDataError, MissingDataErrorType, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { ContentType, INTERNAL_USE_ONLY } from '../../../common/http-request';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentMethodCancelledError, PaymentMethodDeclinedError, PaymentMethodInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethod from '../../payment-method';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentRequestOptions } from '../../payment-request-options';
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
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _zipScriptLoader: ZipScriptLoader,
        private _requestSender: RequestSender
    ) { }

    async initialize(): Promise<InternalCheckoutSelectors> {
        const zip = await this._zipScriptLoader.load();
        this._zipClient = zip;

        return this._store.getState();
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        this._paymentMethod = undefined;
        this._zipClient = undefined;

        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const { _zipClient: zipClient } = this;

        if (!payment) {
            throw new InvalidArgumentError('Unable to submit payment because "payload.payment" argument is not provided.');
        }

        if (!zipClient) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        const { useStoreCredit } = payload;

        if (useStoreCredit !== undefined) {
            await this._store.dispatch(this._storeCreditActionCreator.applyStoreCredit(useStoreCredit));
        }

        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(payment.methodId, options));

        this._paymentMethod = state.paymentMethods.getPaymentMethod(payment.methodId);

        if (!this._paymentMethod || !this._paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        const nonce = await new Promise<string | undefined>((resolve, reject) => {
            zipClient.Checkout.init({
                onComplete: async ({ checkoutId, state }) => {
                    if (state === ZipModalEvent.CancelCheckout) {
                        return reject(new PaymentMethodCancelledError());
                    }

                    if (state === ZipModalEvent.CheckoutReferred && checkoutId) {
                        await this._prepareForReferredRegistration(payment.methodId, checkoutId);

                        return resolve();
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
