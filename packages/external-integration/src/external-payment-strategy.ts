import { FormPoster } from '@bigcommerce/form-poster';

import {
    isRequestError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
    RequestError,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { AdditionalActionRequired, isAdditionalActionRequired } from './is-additional-action';

export default class ExternalPaymentStrategy implements PaymentStrategy {
    constructor(
        private _formPoster: FormPoster,
        private _paymentIntegrationService: PaymentIntegrationService,
    ) {}

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;
        const paymentData = payment && payment.paymentData;

        if (!payment || !paymentData) {
            throw new PaymentArgumentInvalidError(['payment.paymentData']);
        }

        await this._paymentIntegrationService.submitOrder(order, options);

        try {
            await this._paymentIntegrationService.submitPayment({ ...payment, paymentData });
        } catch (error) {
            if (isRequestError(error)) {
                const { body } = error;

                if (isAdditionalActionRequired(body)) {
                    if (!this._isAdditionalActionRequired(body)) {
                        return Promise.reject(error);
                    }

                    const {
                        additional_action_required: {
                            data: { redirect_url },
                        },
                    } = body;

                    return new Promise(() => {
                        if (error instanceof RequestError) {
                            this._formPoster.postForm(redirect_url, {});
                        }
                    });
                }
            }

            throw error;
        }
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

    private _isAdditionalActionRequired(body: AdditionalActionRequired): boolean {
        const { additional_action_required, status } = body;

        return (
            status === 'additional_action_required' &&
            additional_action_required &&
            additional_action_required.type === 'offsite_redirect'
        );
    }
}
