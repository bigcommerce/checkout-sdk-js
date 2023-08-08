import {
    BlueSnapDirectEcpInstrument,
    BlueSnapDirectEcpPayload,
    WithAccountCreation,
    WithBankAccountInstrument,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BrowserInfo } from '../common/browser-info';
import { Omit } from '../common/types';

import PaymentAdditionalAction from './payment-additional-action';

export default interface Payment {
    methodId: string;
    gatewayId?: string;
    paymentData?: PaymentInstrument & PaymentInstrumentMeta;
    additionalAction?: PaymentAdditionalAction;
}

export type PaymentInstrument =
    | BlueSnapDirectEcpInstrument
    | CreditCardInstrument
    | (CreditCardInstrument & WithHostedFormNonce)
    | (CreditCardInstrument & WithDocumentInstrument)
    | (CreditCardInstrument & WithCheckoutcomiDealInstrument)
    | (CreditCardInstrument & WithCheckoutcomFawryInstrument)
    | (CreditCardInstrument & WithCheckoutcomSEPAInstrument)
    | CryptogramInstrument
    | FormattedPayload<
          | AdyenV2Instrument
          | AppleInstrument
          | BlueSnapDirectEcpPayload
          | BoltInstrument
          | PaypalInstrument
          | FormattedHostedInstrument
          | FormattedVaultedInstrument
          | WithDocumentInstrument
          | WithCheckoutcomiDealInstrument
          | WithCheckoutcomFawryInstrument
          | WithCheckoutcomSEPAInstrument
          | StripeV3Intent
          | StripeUPEIntent
          | WithMollieIssuerInstrument
          | StripeV3FormattedPayload
      >
    | HostedInstrument
    | NonceInstrument
    | ThreeDSVaultedInstrument
    | VaultedInstrument
    | (VaultedInstrument & WithHostedFormNonce)
    | WithAccountCreation
    | WithBankAccountInstrument;

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
    browser_info?: BrowserInfo;
}

export interface WithDocumentInstrument {
    ccDocument: string;
}

export interface WithMollieIssuerInstrument {
    issuer: string;
    shopper_locale: string;
}

export interface WithCheckoutcomSEPAInstrument {
    iban: string;
    bic: string;
}

export interface WithCheckoutcomiDealInstrument {
    bic: string;
}

export interface WithCheckoutcomFawryInstrument {
    customerMobile: string;
    customerEmail: string;
}

export interface WithHostedFormNonce {
    hostedFormNonce: string;
}

export type HostedCreditCardInstrument = Omit<
    CreditCardInstrument,
    'ccExpiry' | 'ccName' | 'ccNumber' | 'ccCvv'
>;

export type HostedVaultedInstrument = Omit<VaultedInstrument, 'ccNumber' | 'ccCvv'>;

export type AdyenV2Instrument = AdyenV2Token | AdyenV2Card;

export interface NonceInstrument {
    nonce: string;
    shouldSaveInstrument?: boolean;
    shouldSetAsDefaultInstrument?: boolean;
    deviceSessionId?: string;
    tokenType?: string;
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

interface BoltInstrument {
    credit_card_token: {
        token: string;
        last_four_digits: string;
        iin: string;
        expiration_month: number;
        expiration_year: number;
        brand?: string;
    };
    provider_data: {
        create_account: boolean;
        embedded_checkout: boolean;
    };
}

interface AppleInstrument {
    apple_pay_token: {
        payment_data: ApplePayJS.ApplePayPaymentToken['paymentData'];
        payment_method: ApplePayJS.ApplePayPaymentToken['paymentMethod'];
        transaction_id: ApplePayJS.ApplePayPaymentToken['transactionIdentifier'];
    };
}

interface AdyenV2Token extends FormattedVaultedInstrument {
    origin?: string;
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

interface StripeV3Intent {
    credit_card_token: {
        token: string;
    };
    confirm: boolean;
}

interface StripeUPEIntent {
    credit_card_token: {
        token: string;
    };
    confirm: boolean;
}

export interface FormattedHostedInstrument {
    vault_payment_instrument: boolean | null;
    set_as_default_stored_instrument: boolean | null;
}

export interface FormattedVaultedInstrument {
    bigpay_token:
        | {
              token: string;
              credit_card_number_confirmation?: string;
              expiry_month?: string;
              expiry_year?: string;
              verification_value?: string;
          }
        | string
        | null;
}

export interface FormattedPayload<T> {
    formattedPayload: T;
}

export interface StripeV3FormattedPayload {
    credit_card_token?: {
        token: string;
    };
    vault_payment_instrument?: boolean;
    confirm: boolean;
    set_as_default_stored_instrument?: boolean;
    client_token?: string;
    bigpay_token?: {
        token: string;
    };
}
