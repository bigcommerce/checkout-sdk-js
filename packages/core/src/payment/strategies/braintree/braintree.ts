import { Omit } from '../../../common/types';
import {
    GooglePayBraintreeDataRequest,
    GooglePayBraintreePaymentDataRequestV1,
    GooglePayCreator,
    GooglePaymentData,
    TokenizePayload,
} from '../googlepay';
import { PaypalAuthorizeData, PaypalButtonOptions, PaypalButtonRender, PaypalSDK } from '../paypal';

import {
    VisaCheckoutInitOptions,
    VisaCheckoutPaymentSuccessPayload,
    VisaCheckoutTokenizedPayload,
} from './visacheckout';

/**
 *
 * Constants
 *
 */
export const PAYPAL_COMPONENTS = ['buttons', 'messages'];

/**
 *
 * Common
 *
 */
export interface BraintreeModuleCreator<
    TInstance,
    TOptions = BraintreeModuleCreatorConfig,
    TError = BraintreeError,
> {
    create(
        config: TOptions,
        callback?: (error: TError, instance: TInstance) => void,
    ): Promise<TInstance>;
}

export interface BraintreeModuleCreatorConfig {
    client?: BraintreeClient;
    authorization?: string;
}

export interface BraintreeModule {
    teardown(): Promise<void>;
}

export interface BraintreeSDK {
    client?: BraintreeClientCreator;
    dataCollector?: BraintreeDataCollectorCreator;
    googlePayment?: GooglePayCreator;
    hostedFields?: BraintreeHostedFieldsCreator;
    paypal?: BraintreePaypalCreator;
    paypalCheckout?: BraintreePaypalCheckoutCreator;
    threeDSecure?: BraintreeThreeDSecureCreator;
    venmo?: BraintreeVenmoCheckoutCreator;
    visaCheckout?: BraintreeVisaCheckoutCreator;
}

export interface BraintreePaypalRequest {
    amount: string | number;
    billingAgreementDescription?: string;
    currency?: string;
    displayName?: string;
    enableShippingAddress: true;
    flow: 'checkout' | 'vault';
    intent?: 'authorize' | 'order' | 'sale';
    landingPageType?: 'login' | 'billing';
    locale?: string;
    offerCredit?: boolean;
    shippingAddressEditable?: boolean;
    shippingAddressOverride?: BraintreeShippingAddressOverride;
    useraction?: 'commit';
}

export interface BraintreeShippingAddressOverride {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
    phone?: string;
    recipientName?: string;
}

export interface BraintreeTokenizePayload {
    nonce: string;
    type: 'PaypalAccount' | 'VenmoAccount';
    details: BraintreeDetails;
    creditFinancingOffered?: {
        totalCost: {
            value: string;
            currency: string;
        };
        term: number;
        monthlyPayment: {
            value: string;
            currency: string;
        };
        totalInsterest: {
            value: string;
            currency: string;
        };
        payerAcceptance: boolean;
        cartAmountImmutable: boolean;
    };
}

export interface BraintreeDetails {
    username?: string;
    email?: string;
    payerId?: string;
    firstName?: string;
    lastName?: string;
    countryCode?: string;
    phone?: string;
    shippingAddress?: BraintreeShippingAddress;
    billingAddress?: BraintreeAddress;
}

export interface BraintreeAddress {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
}

export interface BraintreeShippingAddress extends BraintreeAddress {
    recipientName: string;
}

export interface BraintreeVerifyPayload {
    nonce: string;
    details: {
        cardType: string;
        lastFour: string;
        lastTwo: string;
    };
    description: string;
    liabilityShiftPossible: boolean;
    liabilityShifted: boolean;
}

export interface BraintreeError extends Error {
    type: 'CUSTOMER' | 'MERCHANT' | 'NETWORK' | 'INTERNAL' | 'UNKNOWN';
    code: string;
    details?: unknown;
}

/**
 *
 * Braintree Client
 *
 */
export type BraintreeClientCreator = BraintreeModuleCreator<BraintreeClient>;

export interface BraintreeClient {
    request(payload: BraintreeRequestData): Promise<BraintreeTokenizeResponse>;
    getVersion(): string | void;
}

export interface BraintreeRequestData {
    data: {
        creditCard: {
            billingAddress?: {
                countryCodeAlpha2: string;
                locality: string;
                countryName: string;
                postalCode: string;
                streetAddress: string;
            };
            cardholderName: string;
            cvv?: string;
            expirationDate: string;
            number: string;
            options: {
                validate: boolean;
            };
        };
    };
    endpoint: string;
    method: string;
}

export interface BraintreeTokenizeResponse {
    creditCards: BraintreeHostedFieldsTokenizePayload[];
}

/**
 *
 * Braintree Data Collector
 *
 */
export type BraintreeDataCollectorCreator = BraintreeModuleCreator<
    BraintreeDataCollector,
    BraintreeDataCollectorCreatorConfig
>;

export interface BraintreeDataCollectorCreatorConfig extends BraintreeModuleCreatorConfig {
    kount?: boolean;
    paypal?: boolean;
}

export interface BraintreeDataCollector extends BraintreeModule {
    deviceData?: string;
}

/**
 *
 * Braintree Google Pay
 *
 */
export interface BraintreeGooglePayThreeDSecure {
    verifyCard(options: BraintreeGooglePayThreeDSecureOptions): Promise<BraintreeVerifyPayload>;
}

export interface BraintreeGooglePayThreeDSecureOptions {
    nonce: string;
    amount: number;
    showLoader?: boolean;
    onLookupComplete(data: BraintreeThreeDSecureVerificationData, next: () => void): void;
}

export interface GooglePayBraintreeSDK extends BraintreeModule {
    createPaymentDataRequest(
        request?: GooglePayBraintreeDataRequest,
    ): GooglePayBraintreePaymentDataRequestV1;
    parseResponse(paymentData: GooglePaymentData): Promise<TokenizePayload>;
}

/**
 *
 * Braintree Hosted Fields
 *
 */
export type BraintreeHostedFieldsCreator = BraintreeModuleCreator<
    BraintreeHostedFields,
    BraintreeHostedFieldsCreatorConfig
>;

export interface BraintreeHostedFields {
    teardown(): Promise<void>;
    tokenize(
        options?: BraintreeHostedFieldsTokenizeOptions,
    ): Promise<BraintreeHostedFieldsTokenizePayload>;
    on(eventName: string, callback: (event: BraintreeHostedFieldsState) => void): void;
}

export interface BraintreeHostedFieldsCreatorConfig extends BraintreeModuleCreatorConfig {
    fields: {
        number?: BraintreeHostedFieldOption;
        expirationDate?: BraintreeHostedFieldOption;
        expirationMonth?: BraintreeHostedFieldOption;
        expirationYear?: BraintreeHostedFieldOption;
        cvv?: BraintreeHostedFieldOption;
        postalCode?: BraintreeHostedFieldOption;
    };
    styles?: {
        input?: { [key: string]: string };
        '.invalid'?: { [key: string]: string };
        '.valid'?: { [key: string]: string };
        ':focus'?: { [key: string]: string };
    };
}

export interface BraintreeHostedFieldOption {
    container: string | HTMLElement;
    placeholder?: string;
    type?: string;
    formatInput?: boolean;
    maskInput?: boolean | { character?: string; showLastFour?: string };
    select?: boolean | { options?: string[] };
    maxCardLength?: number;
    maxlength?: number;
    minlength?: number;
    prefill?: string;
    rejectUnsupportedCards?: boolean;
    supportedCardBrands?: { [key: string]: boolean };
    internalLabel?: string;
}

export interface BraintreeHostedFieldsState {
    cards: BraintreeHostedFieldsCard[];
    emittedBy: string;
    fields: {
        number?: BraintreeHostedFieldsFieldData;
        expirationDate?: BraintreeHostedFieldsFieldData;
        expirationMonth?: BraintreeHostedFieldsFieldData;
        expirationYear?: BraintreeHostedFieldsFieldData;
        cvv?: BraintreeHostedFieldsFieldData;
        postalCode?: BraintreeHostedFieldsFieldData;
    };
}

export interface BraintreeHostedFieldsCard {
    type: string;
    niceType: string;
    code: { name: string; size: number };
}

export interface BraintreeFormFieldState {
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

export interface BraintreeHostedFieldsFieldData extends BraintreeFormFieldState {
    container: HTMLElement;
}

export type BraintreeFormErrorData = Omit<BraintreeFormFieldState, 'isFocused'>;

export type BraintreeFormErrorDataKeys =
    | 'number'
    | 'expirationDate'
    | 'expirationMonth'
    | 'expirationYear'
    | 'cvv'
    | 'postalCode';

export type BraintreeFormErrorsData = Partial<
    Record<BraintreeFormErrorDataKeys, BraintreeFormErrorData>
>;

export interface BraintreeHostedFieldsTokenizeOptions {
    vault?: boolean;
    fieldsToTokenize?: string[];
    cardholderName?: string;
    billingAddress?: BraintreeBillingAddressRequestData;
}

export interface BraintreeHostedFieldsTokenizePayload {
    nonce: string;
    details: {
        bin: string;
        cardType: string;
        expirationMonth: string;
        expirationYear: string;
        lastFour: string;
        lastTwo: string;
    };
    description: string;
    type: string;
    binData: {
        commercial: string;
        countryOfIssuance: string;
        debit: string;
        durbinRegulated: string;
        healthcare: string;
        issuingBank: string;
        payroll: string;
        prepaid: string;
        productId: string;
    };
}

export interface TokenizationPayload {
    nonce: string;
    bin: string;
}

export interface BraintreeBillingAddressRequestData {
    postalCode?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    streetAddress?: string;
    extendedAddress?: string;
    locality?: string;
    region?: string;
    countryCodeNumeric?: string;
    countryCodeAlpha2?: string;
    countryCodeAlpha3?: string;
    countryName?: string;
}

export interface BraintreeHostedFormError extends BraintreeError {
    details?: {
        invalidFieldKeys?: string[];
    };
}

/**
 *
 * Braintree 3D Secure
 *
 */
export type BraintreeThreeDSecureCreator = BraintreeModuleCreator<
    BraintreeThreeDSecure,
    BraintreeThreeDSecureCreatorConfig
>;

export interface BraintreeThreeDSecure extends BraintreeModule {
    verifyCard(options: BraintreeThreeDSecureOptions): Promise<BraintreeVerifyPayload>;
    cancelVerifyCard(): Promise<BraintreeVerifyPayload>;
}

export interface BraintreeThreeDSecureCreatorConfig extends BraintreeModuleCreatorConfig {
    version?: number;
}

export interface BraintreeThreeDSecureOptions {
    nonce: string;
    amount: number;
    bin?: string;
    challengeRequested: boolean;
    showLoader?: boolean;
    addFrame(error: Error | undefined, iframe: HTMLIFrameElement): void;
    removeFrame(): void;
    onLookupComplete(data: BraintreeThreeDSecureVerificationData, next: () => void): void;
}

interface BraintreeThreeDSecureVerificationData {
    lookup: {
        threeDSecureVersion: string;
    };
    paymentMethod: BraintreeVerifyPayload;
    requiresUserAuthentication: boolean;
    threeDSecureInfo: {
        liabilityShiftPossible: boolean;
        liabilityShifted: boolean;
    };
}

/**
 *
 * Braintree PayPal
 *
 */
export type BraintreePaypalCreator = BraintreeModuleCreator<BraintreePaypal>;

export interface BraintreePaypal {
    closeWindow(): void;
    focusWindow(): void;
    tokenize(options: BraintreePaypalRequest): Promise<BraintreeTokenizePayload>;
    Buttons?(options: PaypalButtonOptions): PaypalButtonRender;
}

/**
 *
 * Braintree PayPal Checkout
 *
 */
export type BraintreePaypalCheckoutCreator = BraintreeModuleCreator<BraintreePaypalCheckout>;

export interface BraintreePaypalCheckout {
    loadPayPalSDK(
        config: BraintreePaypalSdkCreatorConfig,
        callback: (instance: BraintreePaypalCheckout) => void,
    ): void;
    createPayment(options: BraintreePaypalRequest): Promise<string>;
    teardown(): Promise<void>;
    tokenizePayment(options: PaypalAuthorizeData): Promise<BraintreeTokenizePayload>;
}

export interface BraintreePaypalSdkCreatorConfig {
    components?: string;
    currency?: string;
    intent?: string;
    isCreditEnabled?: boolean;
}

/**
 *
 * Braintree Venmo
 *
 */
export type BraintreeVenmoCheckoutCreator = BraintreeModuleCreator<
    BraintreeVenmoCheckout,
    BraintreeVenmoCreatorConfig
>;

export interface BraintreeVenmoCheckout extends BraintreeModule {
    tokenize(callback: (error: BraintreeError, payload: BraintreeTokenizePayload) => void): void;
    isBrowserSupported(): boolean;
}

export interface BraintreeVenmoCreatorConfig extends BraintreeModuleCreatorConfig {
    allowDesktop: boolean;
    paymentMethodUsage: string;
}

/**
 *
 * Braintree Visa Checkout
 *
 */
export type BraintreeVisaCheckoutCreator = BraintreeModuleCreator<BraintreeVisaCheckout>;

export interface BraintreeVisaCheckout extends BraintreeModule {
    tokenize(payment: VisaCheckoutPaymentSuccessPayload): Promise<VisaCheckoutTokenizedPayload>;
    createInitOptions(options: Partial<VisaCheckoutInitOptions>): VisaCheckoutInitOptions;
}

/**
 *
 * Other
 *
 */
export interface BraintreeHostWindow extends Window {
    braintree?: BraintreeSDK;
    paypal?: PaypalSDK;
}

export interface BraintreeInitializationData {
    intent?: 'authorize' | 'order' | 'sale';
    isCreditEnabled?: boolean;
    isAcceleratedCheckoutEnabled?: boolean;
}
