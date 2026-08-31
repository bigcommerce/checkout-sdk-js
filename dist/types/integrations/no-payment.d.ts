import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';

export declare const createNoPaymentStrategy: ResolvableModule<PaymentStrategyFactory<NoPaymentDataRequiredPaymentStrategy>, {
id: string;
}>;

declare class NoPaymentDataRequiredPaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    constructor(_paymentIntegrationService: PaymentIntegrationService);
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    initialize(): Promise<void>;
    deinitialize(): Promise<void>;
}

