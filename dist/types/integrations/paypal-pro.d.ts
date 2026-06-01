import { CardinalThreeDSecureFlow } from '@bigcommerce/checkout-sdk/cardinal-integration';
import { CheckoutButtonStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';

declare class PaypalProPaymentStrategy extends CreditCardPaymentStrategy {
    protected paymentIntegrationService: PaymentIntegrationService;
    private threeDSecureFlow;
    constructor(paymentIntegrationService: PaymentIntegrationService, threeDSecureFlow: CardinalThreeDSecureFlow);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
}

export declare const createPayPalProPaymentStrategy: import("@bigcommerce/checkout-sdk/payment-integration-api").ResolvableModule<CheckoutButtonStrategyFactory<PaypalProPaymentStrategy>, {
    id: string;
}>;
