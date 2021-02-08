export interface BoltHostWindow extends Window {
    BoltCheckout?: BoltCheckout;
}

export interface BoltCheckout {
    configure(cart: BoltCart, hints: {}, callbacks?: BoltCallbacks): BoltClient;
    setClientCustomCallbacks(callbacks: BoltCallbacks): void;
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
