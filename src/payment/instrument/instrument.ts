type PaymentInstrument = CardInstrument | AccountInstrument;

export default PaymentInstrument;

interface BaseInstrument {
    bigpayToken: string;
    defaultInstrument: boolean;
    provider: string;
    trustedShippingAddress: boolean;
    method: string;
    type: string;
}

export interface CardInstrument extends BaseInstrument {
    brand: string;
    expiryMonth: string;
    expiryYear: string;
    iin: string;
    last4: string;
    type: 'card';
}

interface BaseAccountInstrument extends BaseInstrument {
    externalId: string;
    method: string;
    type: 'account' | 'bank';
}

export interface PayPalInstrument extends BaseAccountInstrument {
    method: 'paypal';
}

export interface BankInstrument extends BaseAccountInstrument {
    accountNumber: string;
    issuer: string;
    iban: string;
    method: string;
    type: 'bank';
}

export type AccountInstrument = PayPalInstrument | BankInstrument;

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
