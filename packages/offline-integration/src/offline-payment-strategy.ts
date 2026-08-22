import {
    HostedInstrument,
    OrderFinalizationNotRequiredError,
    OrderRequestBody,
    PaymentIntegrationService,
    PaymentRequestOptions,
    PaymentStrategy,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

interface PurchaseOrderPaymentData extends HostedInstrument {
    purchaseOrderNumber?: string;
}

function isPurchaseOrderPaymentData(data: unknown): data is PurchaseOrderPaymentData {
    return typeof data === 'object' && data !== null && 'purchaseOrderNumber' in data;
}

export default class OfflinePaymentStrategy implements PaymentStrategy {
    constructor(private _paymentIntegrationService: PaymentIntegrationService) {}

    async execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void> {
        const { payment } = payload;
        let purchaseOrderPaymentData: PurchaseOrderPaymentData | undefined;

        if (
            payment?.methodId === 'purchaseorder' &&
            isPurchaseOrderPaymentData(payment.paymentData)
        ) {
            purchaseOrderPaymentData = {
                purchaseOrderNumber: payment.paymentData.purchaseOrderNumber,
            };
        }

        await this._paymentIntegrationService.submitOrder(
            {
                ...payload,
                payment: payment
                    ? {
                          methodId: payment.methodId,
                          ...(purchaseOrderPaymentData && {
                              paymentData: purchaseOrderPaymentData,
                          }),
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
