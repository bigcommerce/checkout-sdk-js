import { isNil, values } from 'lodash';

import {
    HostedForm,
    InvalidArgumentError,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithCreditCardPaymentInitializeOptions } from './credit-card-payment-initialize-options';

export default class CreditCardPaymentStrategy implements PaymentStrategy {
    protected _hostedForm?: HostedForm;
    protected _shouldRenderHostedForm?: boolean;

    constructor(protected _paymentIntegrationService: PaymentIntegrationService) {}

    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        return this._isHostedPaymentFormEnabled(
            payload.payment?.methodId,
            payload.payment?.gatewayId,
        ) && this._shouldRenderHostedForm
            ? this._executeWithHostedForm(payload, options)
            : this._executeWithoutHostedForm(payload, options);
    }

    initialize(
        options?: PaymentInitializeOptions & WithCreditCardPaymentInitializeOptions,
    ): Promise<void> {
        if (
            !this._isHostedPaymentFormEnabled(options?.methodId, options?.gatewayId) ||
            !this._isHostedFieldAvailable(options)
        ) {
            this._shouldRenderHostedForm = false;

            return Promise.resolve();
        }

        const formOptions = options && options.creditCard && options.creditCard.form;
        const state = this._paymentIntegrationService.getState();
        const { paymentSettings: { bigpayBaseUrl: host = '' } = {} } =
            state.getStoreConfigOrThrow();

        if (!formOptions) {
            throw new InvalidArgumentError();
        }

        const form = this._paymentIntegrationService.createHostedForm(host, formOptions);

        return form.attach().then(() => {
            this._shouldRenderHostedForm = true;
            this._hostedForm = form;

            return Promise.resolve();
        });
    }

    deinitialize(): Promise<void> {
        if (this._hostedForm) {
            this._hostedForm.detach();
        }

        return Promise.resolve();
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    protected async _executeWithoutHostedForm(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<void> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        await this._paymentIntegrationService.submitOrder(order, options);

        await this._paymentIntegrationService.submitPayment({ ...payment, paymentData });
    }

    protected async _executeWithHostedForm(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions,
    ): Promise<void> {
        const { payment, ...order } = payload;
        const form = this._hostedForm;

        if (!form) {
            throw new NotInitializedError(NotInitializedErrorType.PaymentNotInitialized);
        }

        if (!payment || !payment.methodId) {
            throw new PaymentArgumentInvalidError(['payment.methodId']);
        }

        await this._paymentIntegrationService.submitOrder(order, options);

        await form.validate().then(() => form.submit(payment));
    }

    protected _isHostedPaymentFormEnabled(methodId?: string, gatewayId?: string): boolean {
        if (!methodId) {
            return false;
        }

        const state = this._paymentIntegrationService.getState();
        const paymentMethod = state.getPaymentMethodOrThrow(methodId, gatewayId);

        return paymentMethod.config.isHostedFormEnabled === true;
    }

    private _isHostedFieldAvailable(
        options?: PaymentInitializeOptions & WithCreditCardPaymentInitializeOptions,
    ): boolean {
        return !values(options && options.creditCard && options.creditCard.form.fields).every(
            isNil,
        );
    }
}
