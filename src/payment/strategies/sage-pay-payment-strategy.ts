import { some } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../checkout';
import { InvalidArgumentError, MissingDataError, RequestError } from '../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../order';
import PaymentActionCreator from '../payment-action-creator';
import { PaymentRequestOptions } from '../payment-request-options';
import * as paymentStatusTypes from '../payment-status-types';

import PaymentStrategy from './payment-strategy';

export default class SagePayPaymentStrategy extends PaymentStrategy {
    constructor(
        store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _formPoster: any
    ) {
        super(store);
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new InvalidArgumentError();
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, true, options))
            .then(() =>
                this._store.dispatch(this._paymentActionCreator.submitPayment(payment))
            )
            .catch(error => {
                if (!(error instanceof RequestError) || !some(error.body.errors, { code: 'three_d_secure_required' })) {
                    return Promise.reject(error);
                }

                return new Promise(() => {
                    this._formPoster.postForm(error.body.three_ds_result.acs_url, {
                        PaReq: error.body.three_ds_result.payer_auth_request,
                        TermUrl: error.body.three_ds_result.callback_url,
                        MD: error.body.three_ds_result.merchant_data,
                    });
                });
            });
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const order = state.order.getOrder();

        if (!order) {
            throw new MissingDataError('Unable to finalize order because "order" data is missing.');
        }

        const { orderId, payment = {} } = order;

        if (orderId && payment.status === paymentStatusTypes.FINALIZE) {
            return this._store.dispatch(this._orderActionCreator.finalizeOrder(orderId, options));
        }

        return super.finalize();
    }
}
