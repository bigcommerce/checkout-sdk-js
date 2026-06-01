import { ExternalPaymentStrategy } from '@bigcommerce/checkout-sdk/external-integration';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';

declare class SezzlePaymentStrategy extends ExternalPaymentStrategy {
    protected redirectUrl(url: string): void;
}

export declare const createSezzlePaymentStrategy: import("@bigcommerce/checkout-sdk/payment-integration-api").ResolvableModule<PaymentStrategyFactory<SezzlePaymentStrategy>, {
    id: string;
}>;
