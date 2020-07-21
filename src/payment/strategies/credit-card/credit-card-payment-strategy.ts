import { isNil, values } from 'lodash';

import { CheckoutStore, InternalCheckoutSelectors } from '../../../checkout';
import { InvalidArgumentError, NotInitializedError, NotInitializedErrorType } from '../../../common/error/errors';
import { HostedForm, HostedFormFactory } from '../../../hosted-form';
import { OrderActionCreator, OrderRequestBody } from '../../../order';
import { OrderFinalizationNotRequiredError } from '../../../order/errors';
import { PaymentArgumentInvalidError } from '../../errors';
import PaymentActionCreator from '../../payment-action-creator';
import { PaymentInitializeOptions, PaymentRequestOptions } from '../../payment-request-options';
import PaymentStrategy from '../payment-strategy';

export default class CreditCardPaymentStrategy implements PaymentStrategy {
    protected _hostedForm?: HostedForm;
    protected _shouldRenderHostedForm?: boolean;

    constructor(
        protected _store: CheckoutStore,
        protected _orderActionCreator: OrderActionCreator,
        protected _paymentActionCreator: PaymentActionCreator,
        protected _hostedFormFactory: HostedFormFactory
    ) {}

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return this._isHostedPaymentFormEnabled(payload.payment?.methodId, payload.payment?.gatewayId) && this._shouldRenderHostedForm ?
            this._executeWithHostedForm(payload, options) :
            this._executeWithoutHostedForm(payload, options);
    }

    finalize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
        if (!this._isHostedPaymentFormEnabled(options?.methodId, options?.gatewayId) || !this._isHostedFieldAvailable(options)) {
            this._shouldRenderHostedForm = false;

            return Promise.resolve(this._store.getState());
        }

        const formOptions = options && options.creditCard && options.creditCard.form;
        const { config } = this._store.getState();
        const { paymentSettings: { bigpayBaseUrl: host = '' } = {} } = config.getStoreConfig() || {};

        if (!formOptions) {
            throw new InvalidArgumentError();
        }

        const form = this._hostedFormFactory.create(host, formOptions);

        return form.attach()
            .then(() => {
                this._shouldRenderHostedForm = true;
                this._hostedForm = form;

                return this._store.getState();
            });
    }

    deinitialize(_options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
        if (this._hostedForm) {
            this._hostedForm.detach();
        }

        return Promise.resolve(this._store.getState());
    }

    protected _executeWithoutHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
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

    protected _executeWithHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors>  {
        const { payment, ...order } = payload;
        const form = this._hostedForm;

        if (!form) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!payment || !payment.methodId) {
            throw new PaymentArgumentInvalidError(['payment.methodId']);
        }

        return form.validate()
            .then(() => this._store.dispatch(this._orderActionCreator.submitOrder(order, options)))
            .then(() => form.submit(payment))
            .then(() => this._store.dispatch(this._orderActionCreator.loadCurrentOrder()));
    }

    protected _isHostedPaymentFormEnabled(methodId?: string, gatewayId?: string): boolean {
        if (!methodId) {
            return false;
        }

        const { paymentMethods: { getPaymentMethodOrThrow } } = this._store.getState();
        const paymentMethod = getPaymentMethodOrThrow(methodId, gatewayId);

        return paymentMethod.config.isHostedFormEnabled === true;
    }

    private _isHostedFieldAvailable(options?: PaymentInitializeOptions): boolean {
        return !(values(options && options.creditCard && options.creditCard.form.fields).every(isNil));
    }
}
