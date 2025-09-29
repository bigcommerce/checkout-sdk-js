import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { RequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { RequestSender } from '@bigcommerce/request-sender';
import { Response } from '@bigcommerce/request-sender';
import { ScriptLoader } from '@bigcommerce/script-loader';

declare interface KlarnaAddress {
    street_address: string;
    street_address2?: string;
    city: string;
    country: string;
    given_name: string;
    family_name: string;
    phone?: string;
    postal_code: string;
    region: string;
    email?: string;
}

declare interface KlarnaAddress_2 {
    street_address: string;
    street_address2?: string;
    city: string;
    country: string;
    given_name: string;
    family_name: string;
    phone?: string;
    postal_code: string;
    region: string;
    email?: string;
    organization_name?: string;
}

declare interface KlarnaAuthorizationResponse {
    authorization_token: string;
    approved: boolean;
    show_form: boolean;
    error?: {
        invalid_fields: string[];
    };
}

declare interface KlarnaAuthorizationResponse_2 {
    authorization_token?: string;
    approved: boolean;
    show_form?: boolean;
    error?: {
        invalid_fields: string[];
    };
}

declare interface KlarnaAuthorizeOptions {
    instance_id?: string;
    payment_method_category: string;
}

declare interface KlarnaCredit {
    authorize(data: KlarnaUpdateSessionParams, callback: (res: KlarnaAuthorizationResponse) => void): void;
    init(params: KlarnaInitParams): void;
    load(params: KlarnaLoadParams, callback: (res: KlarnaLoadResponse) => void): void;
}

declare interface KlarnaInitParams {
    client_token: string;
}

declare interface KlarnaInitParams_2 {
    client_token: string;
}

declare interface KlarnaLoadParams {
    container: string;
    payment_method_category?: string;
    payment_method_categories?: string;
    instance_id?: string;
    preferred_payment_method?: string;
}

declare interface KlarnaLoadParams_2 {
    container: string;
    payment_method_category?: string;
    payment_method_categories?: string;
    instance_id?: string;
    preferred_payment_method?: string;
}

declare interface KlarnaLoadResponse {
    show_form: boolean;
    error?: {
        invalid_fields: string[];
    };
}

declare interface KlarnaLoadResponse_2 {
    show_form: boolean;
    error?: {
        invalid_fields: string[];
    };
}

/**
 * A set of options that are required to initialize the Klarna payment method.
 *
 * When Klarna is initialized, a widget will be inserted into the DOM. The
 * widget has a list of payment options for the customer to choose from.
 *
 * ```html
 * <!-- This is where the widget will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'klarna',
 *     klarna: {
 *         container: 'container'
 *     },
 * });
 * ```
 *
 * An additional event callback can be registered.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'klarnav2',
 *     klarnav2: {
 *         container: 'container',
 *         onLoad(response) {
 *             console.log(response);
 *         },
 *     },
 * });
 * ```
 */
declare interface KlarnaPaymentInitializeOptions {
    /**
     * The ID of a container which the payment widget should insert into.
     */
    container: string;
    /**
     * A callback that gets called when the widget is loaded and ready to be
     * interacted with.
     *
     * @param response - The result of the initialization. It indicates whether
     * or not the widget is loaded successfully.
     */
    onLoad?(response: KlarnaLoadResponse): void;
}

declare class KlarnaPaymentStrategy {
    private paymentIntegrationService;
    private klarnaScriptLoader;
    private klarnaCredit?;
    private unsubscribe?;
    constructor(paymentIntegrationService: PaymentIntegrationService, klarnaScriptLoader: KlarnaScriptLoader);
    initialize(options: PaymentInitializeOptions & WithKlarnaPaymentInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    private loadWidget;
    private getUpdateSessionData;
    private needsStateCode;
    private mapToKlarnaAddress;
    private authorize;
}

declare interface KlarnaPayments {
    authorize(options: KlarnaAuthorizeOptions, data: KlarnaUpdateSessionParams_2, callback: (res: KlarnaAuthorizationResponse_2) => void): void;
    init(params: KlarnaInitParams_2): void;
    load(params: KlarnaLoadParams_2, callback: (res: KlarnaLoadResponse_2) => void): void;
}

declare class KlarnaScriptLoader {
    private scriptLoader;
    private klarnaWindow;
    constructor(scriptLoader: ScriptLoader, klarnaWindow?: KlarnaWindow);
    load(): Promise<KlarnaCredit>;
}

declare type KlarnaUpdateSessionParams = Partial<{
    billing_address: KlarnaAddress;
    shipping_address: KlarnaAddress;
}>;

declare type KlarnaUpdateSessionParams_2 = Partial<{
    billing_address: KlarnaAddress_2;
    shipping_address: KlarnaAddress_2;
}>;

/**
 * A set of options that are required to initialize the KlarnaV2 payment method.
 *
 * When KlarnaV2 is initialized, a list of payment options will be displayed for the customer to choose from.
 * Each one with its own widget.
 *
 * ```html
 * <!-- This is where the widget will be inserted -->
 * <div id="container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'klarnav2',
 *     klarnav2: {
 *         container: 'container'
 *     },
 * });
 * ```
 *
 * An additional event callback can be registered.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'klarnav2',
 *     klarnav2: {
 *         container: 'container',
 *         onLoad(response) {
 *             console.log(response);
 *         },
 *     },
 * });
 * ```
 */
declare interface KlarnaV2PaymentInitializeOptions {
    /**
     * The ID of a container which the payment widget should insert into.
     */
    container: string;
    /**
     * A callback that gets called when the widget is loaded and ready to be
     * interacted with.
     *
     * @param response - The result of the initialization. It indicates whether
     * or not the widget is loaded successfully.
     */
    onLoad?(response: KlarnaLoadResponse_2): void;
}

declare class KlarnaV2PaymentStrategy {
    private paymentIntegrationService;
    private klarnav2ScriptLoader;
    private klarnav2TokenUpdater;
    private klarnaPayments?;
    private unsubscribe?;
    constructor(paymentIntegrationService: PaymentIntegrationService, klarnav2ScriptLoader: KlarnaV2ScriptLoader, klarnav2TokenUpdater: KlarnaV2TokenUpdater);
    initialize(options: PaymentInitializeOptions & WithKlarnaV2PaymentInitializeOptions): Promise<void>;
    deinitialize(): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    private loadPaymentsWidget;
    private getUpdateSessionData;
    private needsStateCode;
    private mapToKlarnaAddress;
    private authorizeOrThrow;
    private isKlarnaSingleRadioButtonEnabled;
}

declare class KlarnaV2ScriptLoader {
    private scriptLoader;
    private klarnaWindow;
    constructor(scriptLoader: ScriptLoader, klarnaWindow?: KlarnaV2Window);
    load(): Promise<KlarnaPayments>;
}

declare class KlarnaV2TokenUpdater {
    private requestSender;
    constructor(requestSender: RequestSender);
    updateClientToken(gatewayId: string, { timeout, params }?: RequestOptions): Promise<Response<PaymentMethod>>;
    klarnaOrderInitialization(cartId: string, clientToken: string | undefined): Promise<void>;
}

declare interface KlarnaV2Window extends Window {
    Klarna?: {
        Payments: KlarnaPayments;
    };
}

declare interface KlarnaWindow extends Window {
    Klarna?: {
        Credit: KlarnaCredit;
    };
}

declare interface WithKlarnaPaymentInitializeOptions {
    klarna?: KlarnaPaymentInitializeOptions;
}

declare interface WithKlarnaV2PaymentInitializeOptions {
    klarnav2?: KlarnaV2PaymentInitializeOptions;
}

export declare const createKlarnaPaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<KlarnaPaymentStrategy>, {
    id: string;
}>;

export declare const createKlarnaV2PaymentStrategy: import("../../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<KlarnaV2PaymentStrategy>, {
    gateway: string;
}>;
