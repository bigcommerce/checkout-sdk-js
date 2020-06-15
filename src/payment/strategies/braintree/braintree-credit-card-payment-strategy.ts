import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { MissingDataError, MissingDataErrorType } from '../../../common/error/errors';
import { OrderActionCreator, OrderPaymentRequestBody, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError, PaymentMethodFailedError } from '../../errors';
import isCreditCardLike from '../../is-credit-card-like';
import isVaultedInstrument from '../../is-vaulted-instrument';
import Payment, { PaymentInstrument } from '../../payment';
import PaymentActionCreator from '../../payment-action-creator';
import PaymentMethodActionCreator from '../../payment-method-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

import BraintreePaymentProcessor from './braintree-payment-processor';

export default class BraintreeCreditCardPaymentStrategy implements PaymentStrategy {
    private _is3dsEnabled?: boolean;
    private _deviceSessionId?: string;

    constructor(
        private _store: CheckoutStore,
        private _orderActionCreator: OrderActionCreator,
        private _paymentActionCreator: PaymentActionCreator,
        private _paymentMethodActionCreator: PaymentMethodActionCreator,
        private _braintreePaymentProcessor: BraintreePaymentProcessor
    ) {}

    async initialize(options: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        const state = await this._store.dispatch(this._paymentMethodActionCreator.loadPaymentMethod(options.methodId));

        const paymentMethod = state.paymentMethods.getPaymentMethod(options.methodId);

        if (!paymentMethod || !paymentMethod.clientToken) {
            throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
        }

        try {
            this._braintreePaymentProcessor.initialize(paymentMethod.clientToken, options.braintree);
            this._is3dsEnabled = paymentMethod.config.is3dsEnabled;

            this._deviceSessionId = await this._braintreePaymentProcessor.getSessionId();
        } catch (error) {
            this._handleError(error);
        }

        return this._store.getState();
    }

    execute(orderRequest: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        const { payment, ...order } = orderRequest;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        return this._store.dispatch(
            this._orderActionCreator.submitOrder(order, options)
        )
            .then(state =>
                state.payment.isPaymentDataRequired(order.useStoreCredit) && payment ?
                    this._preparePaymentData(payment) :
                    Promise.resolve(payment as Payment)
            )
            .then(payment =>
                this._store.dispatch(this._paymentActionCreator.submitPayment(payment))
            )
            .catch((error: Error) => this._handleError(error));
    }

    finalize(): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<InternalCheckoutSelectors> {
        return this._braintreePaymentProcessor.deinitialize()
            .then(() => this._store.getState());
    }

    private _handleError(error: Error): never {
        if (error.name === 'BraintreeError') {
            throw new PaymentMethodFailedError(error.message);
        }

        throw error;
    }

    private _isUsingVaulting(paymentData: PaymentInstrument): boolean {
        if (isCreditCardLike(paymentData)) {
            return Boolean(paymentData.shouldSaveInstrument);
        }

        return isVaultedInstrument(paymentData);
    }

    private async _preparePaymentData(payment: OrderPaymentRequestBody): Promise<Payment> {
        const { paymentData } = payment;
        const state = this._store.getState();

        if (paymentData && this._isUsingVaulting(paymentData)) {
            return Promise.resolve(payment as Payment);
        }

        const order = state.order.getOrder();
        const billingAddress = state.billingAddress.getBillingAddress();

        if (!order) {
            throw new MissingDataError(MissingDataErrorType.MissingOrder);
        }

        if (!billingAddress) {
            throw new MissingDataError(MissingDataErrorType.MissingBillingAddress);
        }

        const updatedPaymentData = this._is3dsEnabled ?
            await this._braintreePaymentProcessor.verifyCard(payment, billingAddress, order.orderAmount) :
            await this._braintreePaymentProcessor.tokenizeCard(payment, billingAddress);

        return ({...payment, paymentData: {...updatedPaymentData, deviceSessionId: this._deviceSessionId} });
    }
}
