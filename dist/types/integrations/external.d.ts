import { FormPoster } from '@bigcommerce/form-poster';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';

declare class ExternalPaymentStrategy implements PaymentStrategy {
    private _formPoster;
    private _paymentIntegrationService;
    constructor(_formPoster: FormPoster, _paymentIntegrationService: PaymentIntegrationService);
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    initialize(): Promise<void>;
    deinitialize(): Promise<void>;
    protected redirectUrl(redirect_url: string): void;
    private _isAdditionalActionRequired;
}

export declare const createExternalPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<ExternalPaymentStrategy>, {
    id: string;
}>;
