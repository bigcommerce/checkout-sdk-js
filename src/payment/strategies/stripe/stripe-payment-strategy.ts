import {CheckoutActionCreator, CheckoutStore, InternalCheckoutSelectors} from '../../../checkout';
import {OrderActionCreator, OrderRequestBody} from '../../../order';
import {OrderFinalizationNotRequiredError} from '../../../order/errors';
import {PaymentArgumentInvalidError} from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import {PaymentInitializeOptions, PaymentRequestOptions} from '../../payment-request-options';
import PaymentStrategyActionCreator from '../../payment-strategy-action-creator';
import ThreeDSecureProcessor from '../3dsecure/threedsecure-processor';
import PaymentStrategy from '../payment-strategy';

export default class StripePaymentStrategy implements PaymentStrategy {

    constructor(
        private _store: CheckoutStore,
        private _checkoutActionCreator: CheckoutActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _paymentStrategyActionCreator: PaymentStrategyActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _orderActionCreator: OrderActionCreator,
        private _threeDSecureProcessor: ThreeDSecureProcessor
    ) {}

    initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        return this._threeDSecureProcessor.doPayment({})
            .then(() => {
                return Promise.resolve(this._store.getState());
            });
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
