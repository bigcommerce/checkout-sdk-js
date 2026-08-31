import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ResolvableModule } from '@bigcommerce/checkout-sdk/payment-integration-api';

export declare const createSquareV2PaymentStrategy: ResolvableModule<PaymentStrategyFactory<PaymentStrategy>, {
id: string;
}>;

