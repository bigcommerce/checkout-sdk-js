import { GooglePaymentData, GooglePayBraintreeDataRequest, GooglePayBraintreePaymentDataRequestV1, GooglePayCreator, TokenizePayload } from '../googlepay';
import { PaypalAuthorizeData, PaypalSDK } from '../paypal';

import { VisaCheckoutInitOptions, VisaCheckoutPaymentSuccessPayload, VisaCheckoutTokenizedPayload } from './visacheckout';

export interface BraintreeSDK {
    client?: BraintreeClientCreator;
    dataCollector?: BraintreeDataCollectorCreator;
    hostedFields?: BraintreeHostedFieldsCreator;
    paypal?: BraintreePaypalCreator;
    paypalCheckout?: BraintreePaypalCheckoutCreator;
    threeDSecure?: BraintreeThreeDSecureCreator;
    visaCheckout?: BraintreeVisaCheckoutCreator;
    googlePayment?: GooglePayCreator;
}

export interface BraintreeModuleCreator<TInstance, TOptions = BraintreeModuleCreatorConfig> {
    create(config: TOptions): Promise<TInstance>;
}

export interface BraintreeModuleCreatorConfig {
    client?: BraintreeClient;
    authorization?: string;
}

export interface BraintreeDataCollectorCreatorConfig extends BraintreeModuleCreatorConfig {
    kount?: boolean;
    paypal?: boolean;
}

export interface BraintreeThreeDSecureCreatorConfig extends BraintreeModuleCreatorConfig {
    version?: number;
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
}

export interface BraintreeClientCreator extends BraintreeModuleCreator<BraintreeClient> { }
export interface BraintreeDataCollectorCreator extends BraintreeModuleCreator<BraintreeDataCollector, BraintreeDataCollectorCreatorConfig> {}
export interface BraintreeHostedFieldsCreator extends BraintreeModuleCreator<BraintreeHostedFields, BraintreeHostedFieldsCreatorConfig> {}
export interface BraintreeThreeDSecureCreator extends BraintreeModuleCreator<BraintreeThreeDSecure, BraintreeThreeDSecureCreatorConfig> {}
export interface BraintreePaypalCreator extends BraintreeModuleCreator<BraintreePaypal> {}
export interface BraintreePaypalCheckoutCreator extends BraintreeModuleCreator<BraintreePaypalCheckout> {}
export interface BraintreeVisaCheckoutCreator extends BraintreeModuleCreator<BraintreeVisaCheckout> {}

export interface BraintreeModule {
    teardown(): Promise<void>;
}

export interface BraintreeClient {
    request(payload: BraintreeRequestData): Promise<BraintreeTokenizeResponse>;
    getVersion(): string | void;
}

export interface BraintreeThreeDSecure extends BraintreeModule {
    verifyCard(options: BraintreeThreeDSecureOptions): Promise<BraintreeVerifyPayload>;
    cancelVerifyCard(): Promise<BraintreeVerifyPayload>;
}

export interface BraintreeThreeDSecureOptions {
    nonce: string;
    amount: number;
    showLoader?: boolean;
    addFrame(error: Error | undefined, iframe: HTMLIFrameElement): void;
    removeFrame(): void;
    onLookupComplete(data: any, next: any): void;
}

export interface BraintreeDataCollector extends BraintreeModule {
    deviceData?: string;
}

export interface BraintreeHostedFields {
    teardown(): Promise<void>;
    tokenize(options?: BraintreeHostedFieldsTokenizeOptions): Promise<BraintreeHostedFieldsTokenizePayload>;
    on(eventName: string, callback: (event: BraintreeHostedFieldsState) => void): void;
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

export interface BraintreeHostedFieldsFieldData {
    container: HTMLElement;
    isFocused: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
    isValid: boolean;
}

export interface BraintreeHostedFieldsTokenizeOptions {
    vault?: boolean;
    authenticationInsight?: {
        merchantAccountId: string;
    };
    fieldsToTokenize?: string[];
    cardholderName?: string;
    billingAddress?: BraintreeBillingAddressRequestData;
}

export interface BraintreeHostedFieldsTokenizePayload {
    nonce: string;
    authenticationInsight?: {
        regulationEnvironment: string;
    };
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

export interface BraintreePaypal {
    closeWindow(): void;
    focusWindow(): void;
    tokenize(options: BraintreePaypalRequest): Promise<BraintreeTokenizePayload>;
}

export interface BraintreePaypalCheckout {
    createPayment(options: BraintreePaypalRequest): Promise<string>;
    teardown(): Promise<void>;
    tokenizePayment(options: PaypalAuthorizeData): Promise<BraintreeTokenizePayload>;
}

export interface BraintreeVisaCheckout extends BraintreeModule {
    tokenize(payment: VisaCheckoutPaymentSuccessPayload): Promise<VisaCheckoutTokenizedPayload>;
    createInitOptions(options: Partial<VisaCheckoutInitOptions>): VisaCheckoutInitOptions;
}

export interface GooglePayBraintreeSDK extends BraintreeModule {
    createPaymentDataRequest(request?: GooglePayBraintreeDataRequest): GooglePayBraintreePaymentDataRequestV1;
    parseResponse(paymentData: GooglePaymentData): Promise<TokenizePayload>;
}

export interface BraintreeTokenizeReturn {
    close(): void;
    focus(): void;
}

export interface BraintreeHostWindow extends Window {
    braintree?: BraintreeSDK;
    paypal?: PaypalSDK;
}

export interface BraintreeTokenizeResponse {
    creditCards: Array<{ nonce: string }>;
}

export interface BraintreeRequestData {
    data: {
        creditCard: {
            billingAddress?: {
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

export interface BraintreeTokenizePayload {
    nonce: string;
    type: 'PaypalAccount';
    details: {
        email: string;
        payerId: string;
        firstName: string;
        lastName: string;
        countryCode?: string;
        phone?: string;
        shippingAddress?: BraintreeShippingAddress;
        billingAddress?: BraintreeAddress;
    };
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
    message: string;
}

export interface BraintreeHostedFormError extends BraintreeError {
    details?: {
        invalidFieldKeys?: string[];
    };
}
