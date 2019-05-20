export default interface Instrument {
    bigpayToken: string;
    defaultInstrument: boolean;
    provider: string;
    iin: string;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
    brand: string;
    trustedShippingAddress: boolean;
}

export interface VaultAccessToken {
    vaultAccessToken: string;
    vaultAccessExpiry: number;
}

export interface SessionContext {
    customerId: number;
    storeId: string;
    currencyCode?: string;
}

export interface InstrumentRequestContext extends SessionContext {
    authToken: string;
}
