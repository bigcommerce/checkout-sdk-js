import { BraintreeModuleCreator } from '../braintree/braintree';

type EnvironmentType = 'PRODUCTION' | 'TEST';
type AddressFormat = 'FULL' | 'MIN';
type TotalPriceStatus = 'ESTIMATED' | 'FINAL' | 'NOT_CURRENTLY_KNOWN';
type TokenizeType = 'AndroidPayCard' | 'CreditCard';
export const GATEWAY = { braintree: 'braintree' };

export interface GooglePayBraintreeSDK {
    createPaymentDataRequest(request?: GooglePayPaymentDataRequest): { allowedPaymentMethods: string[] } | GooglePayBraintreePaymentDataRequest;
    parseResponse(paymentData: GooglePaymentData): Promise<TokenizePayload>;
}

export interface GooglePayCreator extends BraintreeModuleCreator<GooglePayBraintreeSDK> {}

export interface GooglePayPaymentOptions {
    environment: EnvironmentType;
}

export interface GooglePayPaymentDataRequest {
    merchantInfo: {
        merchantId: string,
    };
    transactionInfo: {
        currencyCode: string,
        totalPriceStatus: TotalPriceStatus,
        totalPrice: string,
    };
    cardRequirements: {
        billingAddressRequired: boolean,
        billingAddressFormat: AddressFormat,
    };
    emailRequired: boolean;
    phoneNumberRequired: boolean;
    shippingAddressRequired: boolean;
}

export interface GooglePayBraintreePaymentDataRequest {
    allowedPaymentMethods: string[];
    apiVersion: number;
    cardRequirements: {
        allowedCardNetworks: string[];
        billingAddressFormat: string;
        billingAddressRequired: boolean;
    };
    enviroment: string;
    i: {
        googleTransactionId: string;
        startTimeMs: number;
    };
    merchantInfo: {
        merchantId: string;
    };
    paymentMethodTokenizationParameters: {
        parameters: {
            'braintree:apiVersion': string;
            'braintree:authorizationFingerprint': string;
            'braintree:merchantId': string;
            'braintree:metadata': string;
            'braintree:sdkVersion': string;
            gateway: string;
        };
        tokenizationType: string;
    };
    shippingAddressRequired: boolean;
    transactionInfo: {
        currencyCode: string;
        totalPrice: string;
        totalPriceStatus: string;
    };
}

export interface GooglePayIsReadyToPayResponse {
    result: boolean;
    paymentMethodPresend?: boolean;
}

export interface GooglePaySDK {
    // TODO: Map function PaymentsClient
    payments: any;
}

export interface GooglePayClient {
    isReadyToPay(options: object): Promise<GooglePayIsReadyToPayResponse>;
    loadPaymentData(paymentDataRequest: GooglePayBraintreePaymentDataRequest): Promise<GooglePaymentData>;
}

export interface GooglePayHostWindow extends Window {
    google?: GooglePaySDK;
}

export interface TokenizePayload {
    nonce: string;
    details: {
        cardType: string;
        lastFour: string;
        lastTwo: string;
    };
    description: string;
    type: TokenizeType;
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

export interface GooglePaymentData {
    cardInfo: {
        cardClass: string;
        cardDescription: string;
        cardDetails: string;
        cardImageUri: string;
        cardNetwork: string;
        billingAddress: GooglePayAddress;
    };
    paymentMethodToken: {
        token: string;
        tokenizationType: string;
    };
    shippingAddress: GooglePayAddress;
    email: string;
}

export interface GooglePayAddress {
    address1: string;
    address2: string;
    address3: string;
    address4: string;
    address5: string;
    administrativeArea: string;
    companyName: string;
    countryCode: string;
    locality: string;
    name: string;
    postalCode: string;
    sortingCode: string;
    phoneNumber: string;
}

export interface PaymentSuccessPayload {
    email: string;
    tokenizePayload: TokenizePayload;
    billingAddress: GooglePayAddress;
    shippingAddress: GooglePayAddress;
}

export interface GooglePaymentsError {
    statusCode: string;
    statusMessage?: string;
}

/**
 * A set of options that are required to initialize the Visa Checkout payment
 * method provided by Braintree.
 *
 * If the customer chooses to pay with Visa Checkout, they will be asked to
 * enter their payment details via a modal. You can hook into events emitted by
 * the modal by providing the callbacks listed below.
 */
export interface BraintreeGooglePayPaymentInitializeOptions {
    /**
     * A callback that gets called when Visa Checkout fails to initialize or
     * selects a payment option.
     *
     * @param error - The error object describing the failure.
     */
    onError?(error: Error): void;

    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;
}
