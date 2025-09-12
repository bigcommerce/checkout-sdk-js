import { CardinalThreeDSecureFlow } from '@bigcommerce/checkout-sdk/cardinal-integration';
import { CardinalThreeDSecureFlowV2 } from '@bigcommerce/checkout-sdk/cardinal-integration';
import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';

declare class CyberSourcePaymentStrategy extends CreditCardPaymentStrategy {
    private _threeDSecureFlow;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _threeDSecureFlow: CardinalThreeDSecureFlow);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
}

declare class CyberSourceV2PaymentStrategy extends CreditCardPaymentStrategy {
    private _threeDSecureFlow;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _threeDSecureFlow: CardinalThreeDSecureFlowV2);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
}

export declare const createCyberSourcePaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CyberSourcePaymentStrategy>, {
    id: string;
}>;

export declare const createCyberSourceV2PaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CyberSourceV2PaymentStrategy>, {
    id: string;
}>;
