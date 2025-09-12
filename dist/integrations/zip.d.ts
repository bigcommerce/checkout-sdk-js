import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { StorefrontPaymentRequestSender } from '@bigcommerce/checkout-sdk/payment-integration-api';

declare class ZipPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private storefrontPaymentRequestSender;
    constructor(paymentIntegrationService: PaymentIntegrationService, storefrontPaymentRequestSender: StorefrontPaymentRequestSender);
    initialize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _prepareForReferredRegistration;
}

export declare const createZipPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<ZipPaymentStrategy>, {
    id: string;
}>;
