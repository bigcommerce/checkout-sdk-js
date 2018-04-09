import { omit, some } from 'lodash';

import { CheckoutSelectors, CheckoutStore } from '../../checkout';
import { RequestError } from '../../common/error/errors';
import { OrderRequestBody, PlaceOrderService } from '../../order';
import * as paymentStatusTypes from '../payment-status-types';

import PaymentStrategy from './payment-strategy';

export default class SagePayPaymentStrategy extends PaymentStrategy {
    constructor(
        store: CheckoutStore,
        placeOrderService: PlaceOrderService,
        private _formPoster: any
    ) {
        super(store, placeOrderService);
    }

    execute(payload: OrderRequestBody, options: any): Promise<CheckoutSelectors> {
        return this._placeOrderService.submitOrder(omit(payload, 'payment'), options)
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
        const { orderId, payment = {} } = checkout.getOrder()!;

        if (orderId && payment.status === paymentStatusTypes.FINALIZE) {
            return this._placeOrderService.finalizeOrder(orderId, options);
        }

        return super.finalize();
    }
}
