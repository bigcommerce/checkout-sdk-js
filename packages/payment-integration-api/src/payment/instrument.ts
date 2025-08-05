import { HostedInstrument, NonceInstrument } from './payment';

type PaymentInstrument = CardInstrument | AccountInstrument | HostedInstrument | NonceInstrument;

export default PaymentInstrument;

export interface BaseInstrument {
    bigpayToken: string;
    defaultInstrument: boolean;
    provider: string;
    trustedShippingAddress: boolean;
    method: string;
    type: string;
}

export enum UntrustedShippingCardVerificationType {
    CVV = 'cvv',
    PAN = 'pan',
}

export interface CardInstrument extends BaseInstrument {
    brand: string;
    expiryMonth: string;
    expiryYear: string;
    iin: string;
    last4: string;
    type: 'card';
    untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType;
}

interface BaseAccountInstrument extends BaseInstrument {
    method: string;
    type: 'account' | 'bank';
}

export interface PayPalInstrument extends BaseAccountInstrument {
    externalId: string;
    method: 'paypal';
}

export interface AchInstrument extends BaseAccountInstrument {
    issuer: string;
    accountNumber: string;
    type: 'bank';
    method: 'ach' | 'ecp';
}

export interface BankInstrument extends BaseAccountInstrument {
    accountNumber: string;
    issuer: string;
    iban: string;
    method: string;
    type: 'bank';
}

export type AccountInstrument = PayPalInstrument | BankInstrument | AchInstrument;

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
