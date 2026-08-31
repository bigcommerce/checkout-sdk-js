import { ExternalPaymentStrategy } from '@bigcommerce/checkout-sdk/external-integration';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';

export declare const createSezzlePaymentStrategy: ResolvableModule<PaymentStrategyFactory<SezzlePaymentStrategy>, {
id: string;
}>;

declare class SezzlePaymentStrategy extends ExternalPaymentStrategy {
    protected redirectUrl(url: string): void;
}

