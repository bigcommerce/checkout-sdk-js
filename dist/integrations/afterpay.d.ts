import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ScriptLoader } from '@bigcommerce/script-loader';

declare interface AfterpayDisplayOptions {
    token: string;
}

declare interface AfterpayInitializeOptions {
    countryCode: string;
}

declare class AfterpayPaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    private _afterpayScriptLoader;
    private _afterpaySdk?;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _afterpayScriptLoader: AfterpayScriptLoader);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(options: PaymentRequestOptions): Promise<void>;
    private _redirectToAfterpay;
    private _mapCurrencyToISO2;
    private _loadPaymentMethod;
}

/** Class responsible for loading the Afterpay SDK */
declare class AfterpayScriptLoader {
    private _scriptLoader;
    constructor(_scriptLoader: ScriptLoader);
    /**
     * Loads the appropriate Afterpay SDK depending on the payment method data.
     *
     * @param {PaymentMethod} method the payment method data
     */
    load(method: PaymentMethod, countryCode: string): Promise<AfterpaySdk>;
    private _getScriptURI;
}

declare interface AfterpaySdk {
    initialize(options: AfterpayInitializeOptions): void;
    redirect(options: AfterpayDisplayOptions): void;
}

export declare const createAfterpayPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<AfterpayPaymentStrategy>, {
    gateway: string;
    id?: undefined;
} | {
    id: string;
    gateway?: undefined;
}>;
