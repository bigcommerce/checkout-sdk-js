import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class NetTermsPaymentStrategy implements PaymentStrategy {
    constructor(private _paymentIntegrationService: PaymentIntegrationService) {}

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        await this._paymentIntegrationService.submitOrder(
            {
                ...payload,
                // Unlike the generic offline strategy, Net Terms forwards paymentData so the
                // captured PO Number reaches the backend with the submit order request. There is
                // no separate payment (BigPay) call for this method.
                payment: payload.payment
                    ? {
                          methodId: payload.payment.methodId,
                          gatewayId: payload.payment.gatewayId,
                          paymentData: payload.payment.paymentData,
                      }
                    : undefined,
            },
            options,
        );

        return Promise.resolve();
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
}
