import { noop } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType, RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { RemoteCheckoutActionCreator } from '../../../remote-checkout';
import { StoreCreditActionCreator } from '../../../store-credit';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentRequestOptions } from '../../payment-request-options';
import StorefrontPaymentRequestSender from '../../storefront-payment-request-sender';
import PaymentStrategy from '../payment-strategy';

export default class QuadpayPaymentStrategy implements PaymentStrategy {
    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _storeCreditActionCreator: StoreCreditActionCreator,
        private _remoteCheckoutActionCreator: RemoteCheckoutActionCreator,
        private _storefrontPaymentRequestSender: StorefrontPaymentRequestSender
    ) { }

    initialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        let nonce: { id: string; uri: string };
        const { methodId } = payment;
        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(methodId, options));
        const { clientToken = '' } = state.paymentMethods.getPaymentMethodOrThrow(methodId);

        try {
            nonce = JSON.parse(clientToken);
        } catch (error) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        if (!nonce) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
        }

        const paymentPayload = {
            methodId,
            paymentData: { nonce: nonce.id },
        };

        const { isStoreCreditApplied: useStoreCredit } = this._store.getState().checkout.getCheckoutOrThrow();

        await this._store.dispatch(this._storeCreditActionCreator.applyStoreCredit(useStoreCredit));
        await this._store.dispatch(this._remoteCheckoutActionCreator.initializePayment(methodId, { useStoreCredit }));
        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
        await this._prepareForReferredRegistration(methodId, nonce.id);

        try {
            return await this._store.dispatch(this._paymentActionCreator.submitPayment(paymentPayload));
        } catch (error) {
            if (error instanceof RequestError && error.body.status === 'additional_action_required') {
                window.location.replace(nonce.uri);

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

    private _prepareForReferredRegistration(methodId: string, externalId: string): Promise<void> {
        return this._storefrontPaymentRequestSender.saveExternalId(methodId, externalId);
    }
}
