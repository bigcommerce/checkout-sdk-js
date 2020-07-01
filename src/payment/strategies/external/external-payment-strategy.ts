import { FormPoster } from '@bigcommerce/form-poster';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { RequestError } from '../../../common/error/errors';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

export default class ExternalPaymentStrategy implements PaymentStrategy {

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _formPoster: FormPoster
    ) {}

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));

        try {
            return await this._store.dispatch(this._paymentActionCreator.submitPayment({...payment, paymentData}));
        } catch (error) {
            if (!this._isAdditionalActionRequired(error)) {
                return Promise.reject(error);
            }

            return new Promise(() => {
                this._formPoster.postForm(error.body.additional_action_required.data.redirect_url, { });
            });
        }
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    initialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }

    private _isAdditionalActionRequired(error: RequestError): boolean {
        const { additional_action_required, status } = error.body;

        return status === 'additional_action_required'
            && additional_action_required
            && additional_action_required.type === 'offsite_redirect';
    }
}
