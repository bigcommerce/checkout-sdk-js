import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WorldpayAccessRedirectResponse } from './worldpayaccess-payment-options';

export default class WorldpayAccessOpenBankingPaymentStrategy implements PaymentStrategy {
    constructor(private _paymentIntegrationService: PaymentIntegrationService) {}

    async execute({ payment }: OrderRequestBody): Promise<void> {
        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        await this._paymentIntegrationService.submitOrder();

        try {
            await this._paymentIntegrationService.submitPayment(payment);
        } catch (error) {
            if (this._isWorldpayAccessRedirectResponse(error)) {
                const redirectUrl = error.body.additional_action_required.data.redirect_url;

                return new Promise(() => window.location.replace(redirectUrl));
            }

            return Promise.reject(error);
        }
    }

    initialize(): Promise<void> {
        return Promise.resolve();
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }

    private _isWorldpayAccessRedirectResponse(
        response: unknown,
    ): response is WorldpayAccessRedirectResponse {
        if (typeof response !== 'object' || response === null) {
            return false;
        }

        const partialResponse = response as Partial<WorldpayAccessRedirectResponse>;

        if (!partialResponse.body) {
            return false;
        }

        const partialBody = partialResponse.body;

        return (
            partialBody.status === 'additional_action_required' &&
            !!partialBody.additional_action_required.data.redirect_url
        );
    }
}
