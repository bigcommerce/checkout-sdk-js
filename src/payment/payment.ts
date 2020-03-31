import { BrowserInfo } from '../common/browser-info';
import { Omit } from '../common/types';

export default interface Payment {
    methodId: string;
    gatewayId?: string;
    paymentData?: PaymentInstrument & PaymentInstrumentMeta;
}

export type PaymentInstrument = (
    CreditCardInstrument |
    CryptogramInstrument |
    FormattedPayload<AdyenV2Instrument | PaypalInstrument | FormattedHostedInstrument | FormattedVaultedInstrument> |
    HostedCreditCardInstrument |
    HostedInstrument |
    NonceInstrument |
    ThreeDSVaultedInstrument |
    VaultedInstrument
);

export interface PaymentInstrumentMeta {
    deviceSessionId?: string;
}

export interface CreditCardInstrument {
    ccCustomerCode?: string;
    ccExpiry: {
        month: string;
        year: string;
    };
    ccName: string;
    ccNumber: string;
    ccCvv?: string;
    shouldSaveInstrument?: boolean;
    extraData?: any;
    threeDSecure?: ThreeDSecure | ThreeDSecureToken;
}

export type HostedCreditCardInstrument = Omit<CreditCardInstrument, 'ccExpiry' | 'ccName' | 'ccNumber' | 'ccCvv'>;

export type HostedVaultedInstrument = Omit<VaultedInstrument, 'ccNumber' | 'ccCvv'>;

export type AdyenV2Instrument = AdyenV2Token | AdyenV2Card;

export interface NonceInstrument {
    nonce: string;
    shouldSaveInstrument?: boolean;
    deviceSessionId?: string;
}

export interface VaultedInstrument {
    instrumentId: string;
    ccCvv?: string;
    ccNumber?: string;
}

export interface ThreeDSVaultedInstrument extends VaultedInstrument {
    iin?: string;
    threeDSecure?: ThreeDSecure | ThreeDSecureToken;
}

export interface CryptogramInstrument {
    cryptogramId: string;
    eci: string;
    transactionId?: string;
    ccExpiry: {
        month: string;
        year: string;
    };
    ccNumber: string;
    accountMask: string;
    extraData?: any;
}

export interface ThreeDSecure {
    version: string;
    status: string;
    vendor: string;
    cavv: string;
    eci: string;
    xid: string;
}

export interface ThreeDSecureToken {
    token: string;
}

export interface HostedInstrument {
    shouldSaveInstrument?: boolean;
}

export interface PaypalInstrument {
    vault_payment_instrument: boolean | null;
    device_info: string | null;
    paypal_account: {
        token: string;
        email: string | null;
    };
}

interface AdyenV2Token extends FormattedVaultedInstrument {
    browser_info: BrowserInfo;
    credit_card_token?: void;
}

interface AdyenV2Card {
    browser_info: BrowserInfo;
    credit_card_token: {
        token: string;
    };
    bigpay_token?: void;
}

export interface FormattedHostedInstrument {
    vault_payment_instrument: boolean | null;
}

export interface FormattedVaultedInstrument {
    bigpay_token: {
        token: string;
        credit_card_number_confirmation?: string;
        expiry_month?: string;
        expiry_year?: string;
        verification_value?: string;
    } | string | null;
}

export interface FormattedPayload<T> {
    formattedPayload: T;
}
