import { InternalCheckoutSelectors } from '../../../checkout';
import { NotInitializedError, NotInitializedErrorType, RequestError } from '../../../common/error/errors';
import { OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import { PaymentRequestOptions } from '../../payment-request-options';
import { AdditionalActionRequired, AdditionalActionType } from '../../payment-response-body';
import * as paymentStatusTypes from '../../payment-status-types';
import { CreditCardPaymentStrategy } from '../credit-card';

export default class CheckoutcomCustomPaymentStrategy extends CreditCardPaymentStrategy {

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const order = state.order.getOrder();

        if (order && state.payment.getPaymentStatus() === paymentStatusTypes.FINALIZE) {
            return this._store.dispatch(this._orderActionCreator.finalizeOrder(order.orderId, options));
        }

        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    protected async _executeWithHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors>  {
        const { payment, ...order } = payload;
        const form = this._hostedForm;

        if (!form) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!payment || !payment.methodId) {
            throw new PaymentArgumentInvalidError(['payment.methodId']);
        }

        try {
            await form.validate();
            await this._store.dispatch(this._orderActionCreator.submitOrder(order, options));
            await form.submit(payment);
        } catch (error) {
            return this._processResponse(error);
        }

        return await this._store.dispatch(this._orderActionCreator.loadCurrentOrder());
    }

    protected _processResponse(error: RequestError): Promise<InternalCheckoutSelectors> {
        if (!(error instanceof RequestError)) {
            return Promise.reject(error);
        }

        const additionalActionRequired: AdditionalActionRequired = error.body.additional_action_required;

        // TODO validate all possible responses and perform respective additional actions
        if (additionalActionRequired && additionalActionRequired.type === AdditionalActionType.OffsiteRedirect) {
            return this._performRedirect(additionalActionRequired);
        }

        return Promise.reject(error);
    }

    private _performRedirect(additionalActionRequired: AdditionalActionRequired): Promise<InternalCheckoutSelectors> {
        return new Promise(() => {
            window.location.replace(additionalActionRequired.data.redirect_url);
        });
    }
}
