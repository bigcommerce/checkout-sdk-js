import { FormPoster } from '@bigcommerce/form-poster';
import { some } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { RequestError } from '../../../common/error/errors';
import { HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentRequestOptions } from '../../payment-request-options';
import * as paymentStatusTypes from '../../payment-status-types';
import { CreditCardPaymentStrategy } from '../credit-card';

export default class SagePayPaymentStrategy extends CreditCardPaymentStrategy {
    constructor(
        store: CheckoutStore,
        orderActionCreator: OrderActionCreator,
        paymentActionCreator: PaymentActionCreator,
        hostedFormFactory: HostedFormFactory,
        private _formPoster: FormPoster
    ) {
        super(store, orderActionCreator, paymentActionCreator, hostedFormFactory);
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return super.execute(payload, options)
            .catch((error: Error) => {
                if (!(error instanceof RequestError) || !some(error.body.errors, { code: 'three_d_secure_required' })) {
                    return Promise.reject(error);
                }

                return new Promise(() => {
                    this._formPoster.postForm(error.body.three_ds_result.acs_url, {
                        PaReq: error.body.three_ds_result.payer_auth_request,
                        TermUrl: error.body.three_ds_result.callback_url,
                        MD: error.body.three_ds_result.merchant_data,
                    }, undefined, '_top');
                });
            });
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const order = state.order.getOrder();

        if (order && state.payment.getPaymentStatus() === paymentStatusTypes.FINALIZE) {
            return this._store.dispatch(this._orderActionCreator.finalizeOrder(order.orderId, options));
        }

        return super.finalize(options);
    }
}
