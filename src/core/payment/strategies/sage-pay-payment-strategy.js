import { omit, some } from 'lodash';
import * as paymentStatusTypes from '../payment-status-types';
import PaymentStrategy from './payment-strategy';

export default class SagePayPaymentStrategy extends PaymentStrategy {
    /**
     * @constructor
     * @param {PaymentMethod} paymentMethod
     * @param {ReadableDataStore} store
     * @param {PlaceOrderService} placeOrderService
     * @param {FormPoster} formPoster
     */
    constructor(paymentMethod, store, placeOrderService, formPoster) {
        super(paymentMethod, store, placeOrderService);

        this._formPoster = formPoster;
    }

    /**
     * @inheritdoc
     */
    execute(payload, options) {
        return this._placeOrderService.submitOrder(omit(payload, 'payment'), options)
            .then(() =>
                this._placeOrderService.submitPayment(payload.payment, payload.useStoreCredit, options)
            )
            .catch((state) => {
                const { body } = state.errors.getSubmitOrderError();

                if (!some(body.errors, { code: 'three_d_secure_required' })) {
                    return Promise.reject(state);
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

    /**
     * @inheritdoc
     */
    finalize(options) {
        const { checkout } = this._store.getState();
        const { orderId, payment = {} } = checkout.getOrder();

        if (orderId && payment.status === paymentStatusTypes.FINALIZE) {
            return this._placeOrderService.finalizeOrder(orderId, options);
        }

        return Promise.resolve(this._store.getState());
    }
}
