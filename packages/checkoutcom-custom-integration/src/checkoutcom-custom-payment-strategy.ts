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
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { AdditionalActionRequired, AdditionalActionType } from './checkoutcom';

export default class CheckoutComCustomPaymentStrategy extends CreditCardPaymentStrategy {
    constructor(protected paymentIntegrationService: PaymentIntegrationService) {
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
            return this._processResponse(error);
        }

        this.paymentIntegrationService.loadCurrentOrder();
    }

    protected _processResponse(error: unknown): Promise<void> {
        if (!isRequestError(error)) {
            return Promise.reject(error);
        }

        const additionalActionRequired: AdditionalActionRequired =
            error.body.additional_action_required;

        // TODO validate all possible responses and perform respective additional actions
        if (
            additionalActionRequired &&
            additionalActionRequired.type === AdditionalActionType.OffsiteRedirect
        ) {
            return this._performRedirect(additionalActionRequired);
        }

        return Promise.reject(error);
    }

    private _performRedirect(additionalActionRequired: AdditionalActionRequired): Promise<void> {
        return new Promise(() => {
            window.location.replace(additionalActionRequired.data.redirect_url);
        });
    }
}
