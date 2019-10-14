import { GooglePaymentData, GooglePayBraintreeDataRequest, GooglePayBraintreePaymentDataRequestV1, GooglePayCreator, TokenizePayload } from '../googlepay';
import { PaypalAuthorizeData, PaypalSDK } from '../paypal';

import { VisaCheckoutInitOptions, VisaCheckoutPaymentSuccessPayload, VisaCheckoutTokenizedPayload } from './visacheckout';

export interface BraintreeSDK {
    client?: BraintreeClientCreator;
    dataCollector?: BraintreeDataCollectorCreator;
    paypal?: BraintreePaypalCreator;
    paypalCheckout?: BraintreePaypalCheckoutCreator;
    threeDSecure?: BraintreeThreeDSecureCreator;
    visaCheckout?: BraintreeVisaCheckoutCreator;
    googlePayment?: GooglePayCreator;
}

export interface BraintreeModuleCreator<T> {
    create(config: BraintreeModuleCreatorConfig): Promise<T>;
}

export interface BraintreeModuleCreatorConfig {
    client?: BraintreeClient;
    authorization?: string;
    kount?: boolean;
    paypal?: boolean;
}

export interface BraintreeClientCreator extends BraintreeModuleCreator<BraintreeClient> {}
export interface BraintreeDataCollectorCreator extends BraintreeModuleCreator<BraintreeDataCollector> {}
export interface BraintreeThreeDSecureCreator extends BraintreeModuleCreator<BraintreeThreeDSecure> {}
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
    verifyCard(options: BraintreeThreeDSecureOptions): Promise<{ nonce: string }>;
    cancelVerifyCard(): Promise<BraintreeVerifyPayload>;
}

export interface BraintreeThreeDSecureOptions {
    nonce: string;
    amount: number;
    showLoader?: boolean;
    addFrame(error: Error | undefined, iframe: HTMLIFrameElement): void;
    removeFrame(): void;
}

export interface BraintreeDataCollector extends BraintreeModule {
    deviceData?: string;
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
            billingAddress: {
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
    shippingAddressOverride?: BraintreeAddress;
    useraction?: 'commit';
}

export interface BraintreeAddress {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
    phone?: string;
    recipientName?: string;
    firstName?: string;
    lastName?: string;
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
        shippingAddress?: BraintreeAddress;
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
    details: object;
    message: string;
}
