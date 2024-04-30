import { FormPoster } from '@bigcommerce/form-poster';

import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentExecuteError,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { HummInitializationData, OffsiteRedirectResponse } from './humm';

export default class HummPaymentStrategy implements PaymentStrategy {
    constructor(
        private paymentIntegrationService: PaymentIntegrationService,
        private formPoster: FormPoster,
    ) {}

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment?.methodId) {
            throw new PaymentArgumentInvalidError(['payment.methodId']);
        }

        await this.paymentIntegrationService.loadPaymentMethod(payment.methodId, options);

        const paymentMethod = this.paymentIntegrationService
            .getState()
            .getPaymentMethodOrThrow<HummInitializationData>(payment.methodId);

        if (!paymentMethod.initializationData?.processable) {
            throw new PaymentExecuteError(
                'payment.humm_not_processable_error',
                'hummNotProcessableError',
            );
        }

        await this.paymentIntegrationService.submitOrder(order, options);

        try {
            await this.paymentIntegrationService.submitPayment({
                methodId: payment.methodId,
            });
        } catch (error) {
            if (this.isOffsiteRedirectResponse(error)) {
                return this.handleOffsiteRedirectResponse(error);
            }

            return Promise.reject(error);
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

    private handleOffsiteRedirectResponse(response: OffsiteRedirectResponse): Promise<void> {
        const url = response.body.additional_action_required.data.redirect_url;
        const data = response.body.provider_data;

        return new Promise((resolve) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            this.formPoster.postForm(url, JSON.parse(data), resolve);
        });
    }

    private isOffsiteRedirectResponse(response: unknown): response is OffsiteRedirectResponse {
        if (typeof response !== 'object' || response === null) {
            return false;
        }

        const partialResponse: Partial<OffsiteRedirectResponse> = response;

        if (!partialResponse.body) {
            return false;
        }

        const partialBody: Partial<OffsiteRedirectResponse['body']> = partialResponse.body;

        return (
            partialBody.status === 'additional_action_required' &&
            !!partialBody.additional_action_required &&
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            partialBody.additional_action_required.type === 'offsite_redirect' &&
            typeof partialBody.provider_data === 'string'
        );
    }
}
