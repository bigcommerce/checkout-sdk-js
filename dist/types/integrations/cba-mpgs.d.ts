import { CreditCardPaymentStrategy } from '@bigcommerce/checkout-sdk/credit-card-integration';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ScriptLoader } from '@bigcommerce/script-loader';

declare interface AuthenticatePayerOptionalParams {
    fullScreenRedirect: boolean;
}

declare interface CBAMPGSHostWindow extends Window {
    ThreeDS?: ThreeDSjs;
}

declare class CBAMPGSPaymentStrategy extends CreditCardPaymentStrategy {
    private paymentIntegrationService;
    private cbaMGPSScriptLoader;
    private threeDSjs?;
    private sessionId;
    private locale?;
    constructor(paymentIntegrationService: PaymentIntegrationService, cbaMGPSScriptLoader: CBAMPGSScriptLoader);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(options?: PaymentRequestOptions): Promise<void>;
    deinitialize(): Promise<void>;
    private initiateAuthentication;
    private authenticatePayer;
}

declare class CBAMPGSScriptLoader {
    private _scriptLoader;
    private _window;
    constructor(_scriptLoader: ScriptLoader, _window?: CBAMPGSHostWindow);
    load(testMode?: boolean): Promise<ThreeDSjs>;
}

declare interface RestApiResponse {
    transaction: {
        authenticationStatus: string;
    };
}

declare interface ThreeDSAPIConfiguration {
    userLanguage: string;
    wsVersion: number;
}

declare interface ThreeDSAuthenticationError {
    code: string;
    msg: string;
    cause?: string;
}

declare interface ThreeDSAuthenticationResponse {
    error?: ThreeDSAuthenticationError;
    restApiResponse: RestApiResponse;
    gatewayRecommendation: string;
}

declare interface ThreeDSConfiguration {
    merchantId: string;
    sessionId: string;
    configuration: ThreeDSAPIConfiguration;
    callback(): void;
}

declare interface ThreeDSjs {
    configure(config: ThreeDSConfiguration): Promise<void>;
    isConfigured(): boolean;
    initiateAuthentication(orderId: string, transactionId: string, callback: (data: ThreeDSAuthenticationResponse) => void): void;
    authenticatePayer(orderId: string, transactionId: string, callback: (data: ThreeDSAuthenticationResponse) => void, optionalParams?: AuthenticatePayerOptionalParams): void;
}

export declare const createCBAMPGSPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<CBAMPGSPaymentStrategy>, {
    id: string;
}>;
