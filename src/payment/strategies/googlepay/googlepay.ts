import { Checkout } from '../../../checkout';
import PaymentMethod from '../../payment-method';
import { BraintreeModule, BraintreeModuleCreator } from '../braintree';

export type EnvironmentType = 'PRODUCTION' | 'TEST';
type AddressFormat = 'FULL' | 'MIN';
type TotalPriceStatus = 'ESTIMATED' | 'FINAL' | 'NOT_CURRENTLY_KNOWN';
type TokenizeType = 'AndroidPayCard' | 'CreditCard';
export const GATEWAY = { braintree: 'braintree' };

export interface GooglePayBraintreeSDK extends BraintreeModule {
    createPaymentDataRequest(request?: GooglePayDataRequestV1): GooglePayPaymentDataRequestV1;
    parseResponse(paymentData: GooglePaymentData): Promise<TokenizePayload>;
}

export interface GooglePayInitializer {
    initialize(checkout: Checkout, paymentMethod: PaymentMethod, hasShippingAddress: boolean, publishableKey?: string): Promise<GooglePayPaymentDataRequestV1>;
    teardown(): Promise<void>;
    parseResponse(paymentData: GooglePaymentData): Promise<TokenizePayload>;
}

export interface GooglePayCreator extends BraintreeModuleCreator<GooglePayBraintreeSDK> {}

export interface GooglePayPaymentOptions {
    environment: EnvironmentType;
}

export interface GooglePayDataRequestV1 {
    merchantInfo: {
        authJwt?: string,
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

export interface GooglePayPaymentDataRequestV1 {
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
    payments: {
        api: {
            PaymentsClient: {
                new(options: GooglePayPaymentOptions): GooglePayClient;
            },
        },
    };
}

export interface GooglePayClient {
    isReadyToPay(options: object): Promise<GooglePayIsReadyToPayResponse>;
    loadPaymentData(paymentDataRequest: GooglePayPaymentDataRequestV1): Promise<GooglePaymentData>;
    createButton(options: { [key: string]: string | object }): HTMLElement;
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

export interface GooglePaymentsError {
    statusCode: string;
    statusMessage?: string;
}

export interface PaymentMethodData {
    methodId: string;
    paymentData: {
        method: string,
        nonce: string,
        cardInformation: {
            type: string,
            number: string,
        },
    };
}
