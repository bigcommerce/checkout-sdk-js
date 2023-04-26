import {
    BuyNowCartRequestBody,
    NonceInstrument,
    PaymentMethod,
    WithAccountCreation,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export interface BoltHostWindow extends Window {
    BoltCheckout?: BoltCheckout;
    BoltConnect?: BoltConnect;
    Bolt?(publicKey: string): BoltEmbedded;
}

export interface BoltCheckout {
    configure(cart: BoltCart, hints: Record<string, never>, callbacks?: BoltCallbacks): BoltClient;
    hasBoltAccount(email: string): Promise<boolean>;
    getTransactionReference(): Promise<string | undefined>;
    openCheckout(email: string, callbacks?: BoltOpenCheckoutCallbacks): Promise<void>;
    setClientCustomCallbacks(callbacks: BoltCallbacks): void;
    setOrderId(orderId: number): Promise<void>;
}

export interface BoltConnect {
    setupProductPageCheckout?(): void;
}

export interface BoltOpenCheckoutCallbacks {
    close?(): void;
}

export interface BoltEmbeddedOptions {
    styles: { backgroundColor: string };
    renderSeparateFields?: boolean;
}

export interface BoltEmbedded {
    create(name: string, options?: BoltEmbeddedOptions): BoltEmbededField;
}

export interface BoltEmbededField {
    mount(element: string): void;
    unmount(): void;
    tokenize(): Promise<BoltEmbeddedTokenize | Error>;
}

export interface BoltDeveloperModeParams {
    developerMode: BoltDeveloperMode;
    developerDomain: string;
}

export enum BoltDeveloperMode {
    SandboxMode = 'bolt_sandbox',
    StagingMode = 'bolt_staging',
    DevelopmentMode = 'bolt_development',
}

export interface BoltClient {
    open(): void;
}

export interface BoltCart {
    orderToken: string;
}

export interface BoltCallbacks {
    check?(): boolean;
    onCheckoutStart?(): void;
    onPaymentSubmit?(): void;
    success(transaction: BoltTransaction, callback: () => void): void;
    close?(): void;
}

export interface BoltTransaction {
    id: string;
    type: string;
    processor: string;
    date: number;
    reference: string;
    status: string;
    authorization: BoltAuthorization;
}

export interface BoltAuthorization {
    status: string;
    reason: string;
}

export interface BoltEmbeddedTokenize {
    bin: string;
    expiration: string;
    last4: string;
    postal_code?: string;
    token: string;
    token_type: string;
}

export interface BoltPaymentMethod extends PaymentMethod {
    initializationData?: BoltInitializationData;
}

export interface BoltInitializationData {
    publishableKey: string;
    developerConfig: BoltDeveloperModeParams;
    embeddedOneClickEnabled: boolean;
}

export type BoltPaymentData = WithAccountCreation & NonceInstrument;

export interface BoltBuyNowInitializeOptions {
    storefrontApiToken?: string;
    getBuyNowCartRequestBody(): BuyNowCartRequestBody;
}
