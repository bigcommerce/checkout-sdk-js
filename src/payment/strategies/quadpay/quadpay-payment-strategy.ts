import { RequestSender, Response } from '@bigcommerce/request-sender';
import { noop } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, RequestError } from '../../../common/error/errors';
import { ContentType, INTERNAL_USE_ONLY } from '../../../common/http-request';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

export default class QuadpayPaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _requestSender: RequestSender
    ) { }

    initialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        let nonce: string;
        const { methodId } = payment;
        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId, options));
        const { clientToken = '' } = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        try {
            ({ id: nonce } = JSON.parse(clientToken));
        } catch (error) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!nonce) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
        }

        const paymentPayload = {
            methodId,
            paymentData: { nonce },
        };

        const { isStoreCreditApplied: useStoreCredit } = this._store.getState().checkout.getCheckoutOrThrow();

        await this._store.dispatch(this._storeCreditActionCreator.applyStoreCredit(useStoreCredit));
        await this._store.dispatch(this._remoteCheckoutActionCreator.initializePayment(methodId, { useStoreCredit }));
        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
        await this._prepareForReferredRegistration(methodId, nonce);

        try {
            return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
        } catch (error) {
            if (error instanceof RequestError && error.body.status === 'additional_action_required') {
                const { redirect_url } = error.body.additional_action_required.data;

                window.location.replace(redirect_url);

                return new Promise(noop);
            }

            throw error;
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
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
