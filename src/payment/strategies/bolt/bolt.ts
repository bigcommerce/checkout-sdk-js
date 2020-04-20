export interface BoltHostWindow extends Window {
    BoltCheckout?: BoltCheckout;
}

export interface BoltCheckout {
    configure(cart: BoltCart, hints: {}, callbacks?: BoltCallbacks): BoltClient;
    setClientCustomCallbacks(callbacks: BoltCallbacks): void;
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
    success(transaction: any, callback: () => void): void;
    close?(): void;
}

export interface BoltTransacion {
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
