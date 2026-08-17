import {
    InvalidArgumentError,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    Payment,
    PaymentArgumentInvalidError,
    PaymentInitializeOptions,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { WithBigCommercePaymentsInvoicesPaymentInitializeOptions } from './bigcommerce-payments-invoices-payment-initialize-options';

export default class BigCommercePaymentsInvoicesPaymentStrategy implements PaymentStrategy {
    constructor(private paymentIntegrationService: PaymentIntegrationService) {}

    async initialize(
        options?: PaymentInitializeOptions &
            WithBigCommercePaymentsInvoicesPaymentInitializeOptions,
    ): Promise<void> {
        const { methodId } = options || {};

        if (!methodId) {
            throw new InvalidArgumentError(
                'Unable to initialize payment because "options.methodId" argument is not provided.',
            );
        }

        await this.paymentIntegrationService.loadPaymentMethods();
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
