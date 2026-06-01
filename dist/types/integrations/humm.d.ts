import { FormPoster } from '@bigcommerce/form-poster';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';

declare class HummPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private formPoster;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster);
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    initialize(): Promise<void>;
    deinitialize(): Promise<void>;
    private handleOffsiteRedirectResponse;
    private isOffsiteRedirectResponse;
}

export declare const createHummPaymentStrategy: import("@bigcommerce/checkout-sdk/payment-integration-api").ResolvableModule<PaymentStrategyFactory<HummPaymentStrategy>, {
    id: string;
}>;
