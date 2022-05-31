export interface BoltHostWindow extends Window {
    BoltCheckout?: BoltCheckout;
    Bolt?(publicKey: string): BoltEmbedded;
}

export interface BoltCheckout {
    /* eslint-disable */
    configure(cart: BoltCart, hints: {}, callbacks?: BoltCallbacks): BoltClient;
    hasBoltAccount(email: string): Promise<boolean>;
    getTransactionReference(): Promise<string | undefined>;
    openCheckout(email: string, callbacks?: BoltOpenCheckoutCallbacks): void;
    setClientCustomCallbacks(callbacks: BoltCallbacks): void;
    setOrderId(orderId: number): void;
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
