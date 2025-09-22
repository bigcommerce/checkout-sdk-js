import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import { FormPoster } from '@bigcommerce/form-poster';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';

declare class SagePayPaymentStrategy extends CreditCardPaymentStrategy {
    private paymentIntegrationService;
    private _formPoster;
    constructor(paymentIntegrationService: PaymentIntegrationService, _formPoster: FormPoster);
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(options?: PaymentRequestOptions): Promise<void>;
    private _isThreeDSTwoExperimentOn;
}

export declare const createSagePayPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<SagePayPaymentStrategy>, {
    id: string;
}>;
