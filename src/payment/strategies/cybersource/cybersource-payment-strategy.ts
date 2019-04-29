import {CheckoutStore, InternalCheckoutSelectors} from '../../../checkout';
import {MissingDataError, MissingDataErrorType, RequestError} from '../../../common/error/errors';
import {OrderActionCreator} from '../../../order';
import {OrderFinalizationNotRequiredError} from '../../../order/errors';
import OrderRequestBody from '../../../order/order-request-body';
import {PaymentArgumentInvalidError} from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import {PaymentInitializeOptions, PaymentRequestOptions} from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import {CyberSourceCardinal} from './cybersource';
import CyberSourceScriptLoader from './cybersource-script-loader';

export default class CyberSourcePaymentStrategy implements PaymentStrategy {
    private _Cardinal?: CyberSourceCardinal;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _CyberSourceScriptLoader: CyberSourceScriptLoader
    ) {}

    initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = this._store.getState();
        const paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);

        if (!paymentMethod) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        return this._CyberSourceScriptLoader.load(paymentMethod.config.testMode)
            .then(Cardinal =>  this._Cardinal = Cardinal)
            .then(() => this._store.getState());
    }

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        return this._store.dispatch(this._orderActionCreator.submitOrder(order, options))
            .then(() =>
                this._store.dispatch(this._paymentActionCreator.submitPayment({ ...payment, paymentData }))
            );
    }

    finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.resolve(this._store.getState());
    }
}
