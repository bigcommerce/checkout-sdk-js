import { omit, some } from 'lodash';

import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { MissingDataError, RequestError } from '../../common/error/errors';
import { OrderActionCreator, OrderRequestBody, PlaceOrderService } from '../../order';
import * as paymentStatusTypes from '../payment-status-types';

import PaymentStrategy from './payment-strategy';

export default class SagePayPaymentStrategy extends PaymentStrategy {
    constructor(
        store: CheckoutStore,
        placeOrderService: PlaceOrderService,
        private _orderActionCreator: OrderActionCreator,
        private _formPoster: any
    ) {
        super(store, placeOrderService);
    }

    execute(payload: OrderRequestBody, options: any): Promise<CheckoutSelectors> {
        return this._store.dispatch(this._orderActionCreator.submitOrder(omit(payload, 'payment'), true, options))
            .then(() =>
                this._placeOrderService.submitPayment(payload.payment, payload.useStoreCredit, options)
            )
            .catch((error: RequestError) => {
                const { body } = error;

                if (!some(body.errors, { code: 'three_d_secure_required' })) {
                    return Promise.reject(error);
                }

                return new Promise(() => {
                    this._formPoster.postForm(body.three_ds_result.acs_url, {
                        PaReq: body.three_ds_result.payer_auth_request,
                        TermUrl: body.three_ds_result.callback_url,
                        MD: body.three_ds_result.merchant_data,
                    });
                });
            });
    }

    finalize(options?: any): Promise<CheckoutSelectors> {
        const { checkout } = this._store.getState();
        const order = checkout.getOrder();

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
