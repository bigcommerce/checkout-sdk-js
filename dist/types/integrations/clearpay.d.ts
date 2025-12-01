import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ScriptLoader } from '@bigcommerce/script-loader';

declare interface ClearpayDisplayOptions {
    token: string;
}

declare interface ClearpayInitializeOptions {
    countryCode: string;
}

declare class ClearpayPaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    private _clearpayScriptLoader;
    private _clearpaySdk?;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _clearpayScriptLoader: ClearpayScriptLoader);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(options: PaymentRequestOptions): Promise<void>;
    private _redirectToClearpay;
    private _isCountrySupported;
    private _loadPaymentMethod;
}

declare class ClearpayScriptLoader {
    private _scriptLoader;
    _window: ClearpayWindow;
    constructor(_scriptLoader: ScriptLoader, _window?: ClearpayWindow);
    load(method: PaymentMethod, features?: {}): Promise<ClearpaySdk>;
    private _getScriptUrl;
}

declare interface ClearpaySdk {
    initialize(options: ClearpayInitializeOptions): void;
    redirect(options: ClearpayDisplayOptions): void;
}

declare interface ClearpayWindow extends Window {
    AfterPay?: ClearpaySdk;
}

export declare const createClearpayPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<ClearpayPaymentStrategy>, {
    gateway: string;
    id?: undefined;
} | {
    id: string;
    gateway?: undefined;
}>;
