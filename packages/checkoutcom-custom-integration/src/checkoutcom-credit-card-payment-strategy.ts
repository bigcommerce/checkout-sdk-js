import { FormPoster } from '@bigcommerce/form-poster';
import { some } from 'lodash';

import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import {
    isRequestError,
    NotInitializedError,
    NotInitializedErrorType,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStatusTypes,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class CheckoutComCreditCardPaymentStrategy extends CreditCardPaymentStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        protected formPoster: FormPoster,
    ) {
        super(paymentIntegrationService);
    }

    finalize(options?: PaymentRequestOptions): Promise<void> {
        const state = this.paymentIntegrationService.getState();
        const order = state.getOrder();

        if (order && state.getPaymentStatus() === PaymentStatusTypes.FINALIZE) {
            this.paymentIntegrationService.finalizeOrder(options);
        }

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

        await this.paymentIntegrationService.submitOrder(order, options);

        try {
            await this.paymentIntegrationService.submitPayment({ ...payment, paymentData });
        } catch (error) {
            if (this._isThreeDSecureRequiredError(error)) {
                return this._handleThreeDSecure(error);
            }

            return Promise.reject(error);
        }
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

        try {
            await form.validate();
            await this.paymentIntegrationService.submitOrder(order, options);
            await form.submit(payment);
        } catch (error) {
            if (this._isThreeDSecureRequiredError(error)) {
                return this._handleThreeDSecure(error);
            }

            return Promise.reject(error);
        }

        this.paymentIntegrationService.loadCurrentOrder();
    }

    private _handleThreeDSecure(error: RequestError): Promise<void> {
        const { acs_url, payer_auth_request, callback_url, merchant_data } =
            error.body.three_ds_result;

        return new Promise<void>(() =>
            this.formPoster.postForm(acs_url, {
                PaReq: payer_auth_request || null,
                TermUrl: callback_url || null,
                MD: merchant_data || null,
            }),
        );
    }

    private _isThreeDSecureRequiredError(error: unknown): error is RequestError {
        return (
            isRequestError(error) && some(error.body.errors, { code: 'three_d_secure_required' })
        );
    }
}
