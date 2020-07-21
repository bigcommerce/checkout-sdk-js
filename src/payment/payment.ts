import { BrowserInfo } from '../common/browser-info';
import { Omit } from '../common/types';

import PaymentAdditionalAction from './payment-additional-action';

export default interface Payment {
    methodId: string;
    gatewayId?: string;
    paymentData?: PaymentInstrument & PaymentInstrumentMeta;
    additionalAction?: PaymentAdditionalAction;
}

export type PaymentInstrument = (
    CreditCardInstrument |
    CreditCardInstrument & WithHostedFormNonce |
    CryptogramInstrument |
    FormattedPayload<AdyenV2Instrument | PaypalInstrument | FormattedHostedInstrument | FormattedVaultedInstrument> |
    HostedInstrument |
    NonceInstrument |
    ThreeDSVaultedInstrument |
    VaultedInstrument |
    VaultedInstrument & WithHostedFormNonce |
    VaultedInstrumentWithNonceVerification
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
    shouldSetAsDefaultInstrument?: boolean;
    extraData?: any;
    threeDSecure?: ThreeDSecure | ThreeDSecureToken;
}

export interface WithHostedFormNonce {
    hostedFormNonce: string;
}

export type HostedCreditCardInstrument = Omit<CreditCardInstrument, 'ccExpiry' | 'ccName' | 'ccNumber' | 'ccCvv'>;

export type HostedVaultedInstrument = Omit<VaultedInstrument, 'ccNumber' | 'ccCvv'>;

export type AdyenV2Instrument = AdyenV2Token | AdyenV2Card;

export interface NonceInstrument {
    nonce: string;
    shouldSaveInstrument?: boolean;
    shouldSetAsDefaultInstrument?: boolean;
    deviceSessionId?: string;
}

export interface VaultedInstrument {
    instrumentId: string;
    ccCvv?: string;
    ccNumber?: string;
}

export interface VaultedInstrumentWithNonceVerification {
    instrumentId: string;
    nonce: string;
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
    shouldSetAsDefaultInstrument?: boolean;
}

export interface PaypalInstrument {
    vault_payment_instrument: boolean | null;
    set_as_default_stored_instrument: boolean | null;
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
    set_as_default_stored_instrument: boolean | null;
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
