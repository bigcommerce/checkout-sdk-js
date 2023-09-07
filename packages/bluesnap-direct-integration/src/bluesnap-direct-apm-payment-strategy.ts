import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import isBlueSnapDirectRedirectResponseProviderData from './is-bluesnap-direct-provider-data';
import { BlueSnapDirectRedirectResponse } from './types';

export default class BlueSnapDirectAPMPaymentStrategy implements PaymentStrategy {
    constructor(private _paymentIntegrationService: PaymentIntegrationService) {}

    async execute(payload: OrderRequestBody, options?: PaymentInitializeOptions): Promise<void> {
        const { payment, ...order } = payload;

        if (!payment) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        await this._paymentIntegrationService.submitOrder(order, options);

        try {
            await this._paymentIntegrationService.submitPayment({
                methodId: payment.methodId,
            });
        } catch (error) {
            if (this._isBlueSnapDirectRedirectResponse(error)) {
                const providerData: unknown = JSON.parse(error.body.provider_data);

                if (isBlueSnapDirectRedirectResponseProviderData(providerData)) {
                    const providerDataQuery = new URLSearchParams(providerData).toString();

                    const frameUrl = `${error.body.additional_action_required.data.redirect_url}&${providerDataQuery}`;

                    return new Promise(() => window.location.replace(frameUrl));
                }

                return Promise.reject(error);
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

    private _isBlueSnapDirectRedirectResponse(
        response: unknown,
    ): response is BlueSnapDirectRedirectResponse {
        if (typeof response !== 'object' || response === null) {
            return false;
        }

        const partialResponse: Partial<BlueSnapDirectRedirectResponse> = response;

        if (!partialResponse.body) {
            return false;
        }

        const partialBody: Partial<BlueSnapDirectRedirectResponse['body']> = partialResponse.body;

        return (
            partialBody.status === 'additional_action_required' &&
            !!partialBody.additional_action_required?.data.redirect_url &&
            typeof partialBody.provider_data === 'string'
        );
    }
}
