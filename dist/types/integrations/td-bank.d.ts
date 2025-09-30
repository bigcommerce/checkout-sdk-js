import { FormPoster } from '@bigcommerce/form-poster';
import { OrderRequestBody } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentInitializeOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentRequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategy } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentStrategyFactory } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { ScriptLoader } from '@bigcommerce/script-loader';

declare interface Classes {
    base?: string;
    complete?: string;
    empty?: string;
    focus?: string;
    error?: string;
}

declare interface CreateTokenError {
    field: string;
    type: string;
    message: string;
}

declare interface CreateTokenResponse {
    code: string;
    error?: CreateTokenError;
    token?: string;
    last4?: string;
    expiryMonth?: string;
    expiryYear?: string;
}

declare interface CssStyles {
    color?: string;
    fontFamily?: string;
    fontSize?: string;
    fontStyle?: string;
    fontWeight?: string;
    textDecoration?: string;
    padding?: string;
    paddingLeft?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
}

declare interface FieldOptions {
    placeholder?: string;
    style?: Styles;
    classes?: Classes;
    brands?: string[];
}

declare enum FieldType {
    CARD_NUMBER = "card-number",
    CVV = "cvv",
    EXPIRY = "expiry"
}

declare interface Styles {
    base?: CssStyles;
    complete?: CssStyles;
    empty?: CssStyles;
    error?: CssStyles;
}

declare interface TDCustomCheckoutSDK {
    create(fieldType: FieldType, options?: FieldOptions): TdOnlineMartElement;
    createToken(callback: (result: CreateTokenResponse) => void): void;
}

declare class TDOnlineMartPaymentStrategy implements PaymentStrategy {
    private paymentIntegrationService;
    private tdOnlineMartScriptLoader;
    private formPoster;
    private tdOnlineMartClient?;
    private tdInputs;
    constructor(paymentIntegrationService: PaymentIntegrationService, tdOnlineMartScriptLoader: TDOnlineMartScriptLoader, formPoster: FormPoster);
    initialize(options: PaymentInitializeOptions): Promise<void>;
    execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<void>;
    finalize(): Promise<void>;
    deinitialize(): Promise<void>;
    private getPaymentPayloadOrThrow;
    private mountHostedFields;
    private loadTDOnlineMartJs;
    private getTokenOrThrow;
    private getTDOnlineMartClientOrThrow;
    private processWithAdditionalAction;
    private throwTokenizationError;
    private getHostedFieldsOptions;
    private isTrustedVaultingInstrument;
}

declare class TDOnlineMartScriptLoader {
    private scriptLoader;
    private tdOnlineMartWindow;
    constructor(scriptLoader: ScriptLoader, tdOnlineMartWindow?: TdOnlineMartHostWindow);
    load(): Promise<TDCustomCheckoutSDK>;
}

declare interface TdOnlineMartElement {
    mount(cssSelector: string): void;
    unmount(): void;
}

declare interface TdOnlineMartHostWindow extends Window {
    customcheckout?(): TDCustomCheckoutSDK;
}

export declare const createTDOnlineMartPaymentStrategy: import("../../payment-integration-api/src/resolvable-module").default<PaymentStrategyFactory<TDOnlineMartPaymentStrategy>, {
    id: string;
}>;
