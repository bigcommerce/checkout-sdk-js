export default interface Instrument {
    bigpay_token: string;
    provider: string;
    iin: string;
    last_4: string;
    expiry_month: string;
    expiry_year: string;
    brand: string;
    default_instrument: boolean;
    trusted_shipping_address: boolean;
}

export interface VaultAccessToken {
    vaultAccessToken: string;
    vaultAccessExpiry: number;
}

export interface SessionContext {
    customerId: number;
    storeId: string;
}

export interface InstrumentRequestContext extends SessionContext {
    authToken: string;
}
