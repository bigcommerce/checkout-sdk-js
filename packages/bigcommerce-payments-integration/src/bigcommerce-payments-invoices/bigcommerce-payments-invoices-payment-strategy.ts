import {
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export default class BigCommercePaymentsInvoicesPaymentStrategy implements PaymentStrategy {
    constructor(private paymentIntegrationService: PaymentIntegrationService) {}

    async initialize(): Promise<void> {
        return Promise.resolve();
    }

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment, ...order } = payload;
        const { methodId } = payment || {};

        if (!payment || !methodId) {
            throw new PaymentArgumentInvalidError(['payment']);
        }

        const submitPaymentPayload: Payment = {
            methodId,
            paymentData: {
                formattedPayload: {},
            },
        };

        await this.paymentIntegrationService.submitOrder(order, options);
        await this.paymentIntegrationService.submitPayment(submitPaymentPayload);
    }

    finalize(): Promise<void> {
        return Promise.reject(new OrderFinalizationNotRequiredError());
    }

    deinitialize(): Promise<void> {
        return Promise.resolve();
    }
}
