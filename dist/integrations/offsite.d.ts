import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';

declare class OffsitePaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    constructor(_paymentIntegrationService: PaymentIntegrationService);
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(options?: PaymentRequestOptions): Promise<void>;
    initialize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _shouldSubmitFullPayload;
}

export declare const createOffsitePaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<OffsitePaymentStrategy>, {
    type: string;
}>;
