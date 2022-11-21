import { FormPoster } from '@bigcommerce/form-poster';

import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
    RequestError,
} from "@bigcommerce/checkout-sdk/payment-integration-api";

export default class ExternalPaymentStrategy implements PaymentStrategy   {
    constructor(
        private _formPoster: FormPoster,
        private _paymentIntegrationService: PaymentIntegrationService,
    ) {}

    async execute(
        payload: OrderRequestBody,
        options?: PaymentRequestOptions
    ): Promise<void> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        await this._paymentIntegrationService.submitOrder(
            order, options
        );

        try {
            await this._paymentIntegrationService.submitPayment({...payment, paymentData});
        } catch (error) {
            if (!this._isAdditionalActionRequired(error)) {
                return Promise.reject(error);
            }

            return new Promise(() => {
                this._formPoster.postForm(error.body.additional_action_required.data.redirect_url, {});
            });
        }

        return;
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _isAdditionalActionRequired(error: RequestError): boolean {
        const { additional_action_required, status } = error.body;

        return status === 'additional_action_required'
            && additional_action_required
            && additional_action_required.type === 'offsite_redirect';
    }
}
