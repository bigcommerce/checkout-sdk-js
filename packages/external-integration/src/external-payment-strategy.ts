import { FormPoster } from '@bigcommerce/form-poster';

import {
    isRequestError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
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
            if (
                !isRequestError(error) ||
                !isAdditionalActionRequired(error.body) ||
                !this._isAdditionalActionRequired(error.body)
            ) {
                return Promise.reject(error);
            }

            const {
                body: {
                    additional_action_required: {
                        data: { redirect_url },
                    },
                },
            } = error;

            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            return new Promise(() => {
                this.redirectUrl(redirect_url);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }) as any;
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

    protected redirectUrl(redirect_url: string): void {
        return this._formPoster.postForm(redirect_url, {});
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
