import { BrowserInfo } from '../browser';
import { Omit } from '../util-types';

import PaymentAdditionalAction from './payment-additional-action';

export default interface Payment {
    methodId: string;
    gatewayId?: string;
    paymentData?: PaymentInstrumentPayload & PaymentInstrumentMeta;
    additionalAction?: PaymentAdditionalAction;
}

export type PaymentInstrumentPayload =
    | WithEcpInstrument
    | WithSepaInstrument
    | WithIdealInstrument
    | CreditCardInstrument
    | (CreditCardInstrument & WithHostedFormNonce)
    | (CreditCardInstrument & WithDocumentInstrument)
    | (CreditCardInstrument & WithIdealInstrument)
    | (CreditCardInstrument & WithCheckoutcomFawryInstrument)
    | (CreditCardInstrument & WithCheckoutcomSEPAInstrument)
    | CryptogramInstrument
    | FormattedPayload<
          | AdyenV2Instrument
          | AppleInstrument
          | BlueSnapDirectCreditCardInstrument
          | BlueSnapDirectEcpPayload
          | IdealPayload
          | BlueSnapDirectSepaPayload
          | BoltInstrument
          | PaypalInstrument
          | FormattedHostedInstrument
          | FormattedVaultedInstrument
          | WithDocumentInstrument
          | WithIdealInstrument
          | WithCheckoutcomFawryInstrument
          | WithCheckoutcomSEPAInstrument
          | StripeV3Intent
          | StripeV3FormattedPayload
          | StripeUPEIntent
          | WithMollieIssuerInstrument
          | WithPayPalConnectInstrument
          | PaypalGooglePayInstrument
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

export interface WithAccountCreation {
    shouldCreateAccount?: boolean;
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

type BankAccountType = 'Checking' | 'Savings';

export interface WithBankAccountInstrument {
    accountNumber: string;
    routingNumber: string;
    ownershipType: 'Personal' | 'Business';
    accountType: BankAccountType | EcpAccountType;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    shouldSaveInstrument?: boolean;
    shouldSetAsDefaultInstrument?: boolean;
    instrumentId?: string;
}

export interface WithDocumentInstrument {
    ccDocument: string;
}

export interface WithMollieIssuerInstrument {
    issuer: string;
    shopper_locale: string;
}

export interface WithPayPalConnectInstrument {
    paypal_connect_token: {
        order_id?: string;
        token: string;
    };
}

export interface WithIdealInstrument {
    bic: string;
}

export interface IdealPayload {
    ideal: WithIdealInstrument;
}

export interface WithCheckoutcomSEPAInstrument {
    iban: string;
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

export interface PaypalGooglePayInstrument {
    method_id: string | null;
    paypal_account: {
        order_id: string;
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

interface BlueSnapDirectCreditCardInstrument {
    credit_card_token: {
        token: string;
    };
}

type EcpAccountType =
    | 'CONSUMER_CHECKING'
    | 'CONSUMER_SAVINGS'
    | 'CORPORATE_CHECKING'
    | 'CORPORATE_SAVINGS';

export interface WithEcpInstrument {
    accountNumber: string;
    accountType: BankAccountType | EcpAccountType;
    shopperPermission: boolean;
    routingNumber: string;
    shouldSaveInstrument?: boolean;
    shouldSetAsDefaultInstrument?: boolean;
    instrumentId?: string;
}

export interface BlueSnapDirectEcpPayload extends FormattedHostedInstrument {
    ecp: {
        account_number: string;
        account_type: EcpAccountType | BankAccountType;
        shopper_permission: boolean;
        routing_number: string;
    };
}

export interface WithSepaInstrument {
    firstName: string;
    lastName: string;
    iban: string;
    shopperPermission: boolean;
    shouldSaveInstrument?: boolean;
    shouldSetAsDefaultInstrument?: boolean;
    instrumentId?: string;
}

export interface BlueSnapDirectSepaPayload extends FormattedHostedInstrument {
    sepa_direct_debit: {
        first_name: string;
        last_name: string;
        shopper_permission: boolean;
        iban: string;
    };
}

interface StripeV3Intent {
    credit_card_token: {
        token: string;
    };
    confirm: boolean;
}

export interface StripeUPEIntent {
    cart_id: string;
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
