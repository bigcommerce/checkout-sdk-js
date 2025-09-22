import { AdyenV2ScriptLoader } from '@bigcommerce/checkout-sdk/adyen-utils';
import { AdyenV3ScriptLoader } from '@bigcommerce/checkout-sdk/adyen-utils';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { WithAdyenV2PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/adyen-utils';
import { WithAdyenV3PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/adyen-utils';

declare class AdyenV2PaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    private _scriptLoader;
    private _adyenClient?;
    private _cardVerificationComponent?;
    private _componentState?;
    private _paymentComponent?;
    private _paymentInitializeOptions?;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _scriptLoader: AdyenV2ScriptLoader);
    initialize(options: PaymentInitializeOptions & WithAdyenV2PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _getAdyenClient;
    private _getPaymentInitializeOptions;
    private _getThreeDS2ChallengeWidgetSize;
    private _handleAction;
    private _mapAdyenPlaceholderData;
    private _mountCardVerificationComponent;
    private _mountPaymentComponent;
    private _processAdditionalAction;
    private _updateComponentState;
    private _validateCardData;
    private _mapCardErrors;
}

declare class Adyenv3PaymentStrategy implements PaymentStrategy {
    private _paymentIntegrationService;
    private _scriptLoader;
    private _adyenClient?;
    private _cardVerificationComponent?;
    private _componentState?;
    private _paymentComponent?;
    private _paymentInitializeOptions?;
    constructor(_paymentIntegrationService: PaymentIntegrationService, _scriptLoader: AdyenV3ScriptLoader);
    initialize(options: PaymentInitializeOptions & WithAdyenV3PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private _updateComponentState;
    private _getLocale;
    private _getAdyenClient;
    private _getPaymentInitializeOptions;
    private _handleAction;
    private _mapAdyenPlaceholderData;
    private _mountCardVerificationComponent;
    private _mountPaymentComponent;
    private _processAdditionalAction;
    private _validateCardData;
    private _mapCardErrors;
    private _mountElement;
}

export declare const createAdyenV2PaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<AdyenV2PaymentStrategy>, {
    gateway: string;
}>;

export declare const createAdyenV3PaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<Adyenv3PaymentStrategy>, {
    gateway: string;
}>;
