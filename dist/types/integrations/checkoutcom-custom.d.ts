import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import { FormPoster } from '@bigcommerce/form-poster';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';

declare class CheckoutComCreditCardPaymentStrategy extends CreditCardPaymentStrategy {
    private paymentIntegrationService;
    protected formPoster: FormPoster;
    constructor(paymentIntegrationService: PaymentIntegrationService, formPoster: FormPoster);
    finalize(options?: PaymentRequestOptions): Promise<void>;
    protected _executeWithoutHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    protected _executeWithHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    private _handleThreeDSecure;
}

declare class CheckoutComCustomPaymentStrategy extends CreditCardPaymentStrategy {
    protected paymentIntegrationService: PaymentIntegrationService;
    constructor(paymentIntegrationService: PaymentIntegrationService);
    finalize(options?: PaymentRequestOptions): Promise<void>;
    protected _executeWithHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    protected _processResponse(error: unknown): Promise<void>;
    private _performRedirect;
}

declare class CheckoutComFawryPaymentStrategy extends CheckoutComCustomPaymentStrategy {
    protected _executeWithoutHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    private _createFormattedPayload;
}

declare class CheckoutComSEPAPaymentStrategy extends CheckoutComCustomPaymentStrategy {
    protected _executeWithoutHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    private _createFormattedPayload;
}

declare class CheckoutComiDealPaymentStrategy extends CheckoutComCustomPaymentStrategy {
    protected _executeWithoutHostedForm(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    private _createFormattedPayload;
}

export declare const createCheckoutComAPMPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CheckoutComCustomPaymentStrategy>, {
    gateway: string;
}>;

export declare const createCheckoutComCreditCardPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CheckoutComCreditCardPaymentStrategy>, {
    gateway: string;
    id: string;
}>;

export declare const createCheckoutComFawryPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CheckoutComFawryPaymentStrategy>, {
    gateway: string;
    id: string;
}>;

export declare const createCheckoutComIdealPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CheckoutComiDealPaymentStrategy>, {
    gateway: string;
    id: string;
}>;

export declare const createCheckoutComSepaPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CheckoutComSEPAPaymentStrategy>, {
    gateway: string;
    id: string;
}>;
