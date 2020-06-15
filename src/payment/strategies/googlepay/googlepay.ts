import { Checkout } from '../../../checkout';
import PaymentMethod from '../../payment-method';
import { BraintreeModuleCreator, GooglePayBraintreeSDK } from '../braintree';

export type EnvironmentType = 'PRODUCTION' | 'TEST';
export type TokenizeType = 'AndroidPayCard' | 'CreditCard' | 'CARD';

export interface GooglePayInitializer {
    initialize(checkout: Checkout, paymentMethod: PaymentMethod, hasShippingAddress: boolean, publishableKey?: string): Promise<GooglePayPaymentDataRequestV2>;
    teardown(): Promise<void>;
    parseResponse(paymentData: GooglePaymentData): Promise<TokenizePayload>;
}

export interface GooglePayCreator extends BraintreeModuleCreator<GooglePayBraintreeSDK> {}

export interface GooglePayPaymentOptions {
    environment: EnvironmentType;
}

export interface GooglePayIsReadyToPayResponse {
    result: boolean;
    paymentMethodPresend?: boolean;
}

export interface GooglePaySDK {
    payments: {
        api: {
            PaymentsClient: new(options: GooglePayPaymentOptions) => GooglePayClient;
        };
    };
}

export interface GooglePayClient {
    isReadyToPay(options: object): Promise<GooglePayIsReadyToPayResponse>;
    loadPaymentData(paymentDataRequest: GooglePayPaymentDataRequestV2): Promise<GooglePaymentData>;
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
        lastTwo?: string;
    };
    description?: string;
    type: TokenizeType;
    binData?: {
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
    apiVersion: number;
    apiVersionMinor: number;
    paymentMethodData: {
        description: string;
        info: {
            cardDetails: string;
            cardNetwork: string;
            billingAddress: GooglePayAddress;
        };
        tokenizationData: {
            token: string;
            type: string;
        };
        type: string;
    };
    shippingAddress: GooglePayAddress;
    email: string;
}

export interface GooglePayAddress {
    address1: string;
    address2: string;
    address3: string;
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
        method: string;
        nonce: string;
        cardInformation: {
            type: string;
            number: string;
        };
    };
}

export enum ButtonType {
    Long = 'long',
    Short = 'short',
}
export enum ButtonColor {
    Default = 'default',
    Black = 'black',
    White = 'white',
}

export interface TokenizationSpecification {
    type: string;
    parameters: {
        gateway: string;
        gatewayMerchantId?: string;
        'braintree:apiVersion'?: string;
        'braintree:clientKey'?: string;
        'braintree:merchantId'?: string;
        'braintree:sdkVersion'?: string;
        'braintree:authorizationFingerprint'?: string;
        'stripe:version'?: string;
        'stripe:publishableKey'?: string;
    };
}

export enum BillingAddressFormat {
    /*
     * Name, country code, and postal code (default).
     */
    Min = 'MIN',
    /*
     * Name, street address, locality, region, country code, and postal code.
     */
    Full = 'FULL',
}

export interface GooglePayPaymentDataRequestV2 {
    apiVersion: number;
    apiVersionMinor: number;
    merchantInfo: {
        authJwt?: string;
        merchantId?: string;
        merchantName?: string;
    };
    allowedPaymentMethods: [{
        type: string;
        parameters: {
            allowedAuthMethods: string[];
            allowedCardNetworks: string[];
            allowPrepaidCards?: boolean;
            billingAddressRequired?: boolean;
            billingAddressParameters?: {
                format?: BillingAddressFormat;
                phoneNumberRequired?: boolean;
            };
        };
        tokenizationSpecification?: TokenizationSpecification;
    }];
    transactionInfo: {
        currencyCode: string;
        countryCode?: string;
        totalPriceStatus: string;
        totalPrice?: string;
        checkoutOption?: string;
    };
    emailRequired?: boolean;
    shippingAddressRequired?: boolean;
    shippingAddressParameters?: {
        allowedCountryCodes?: string[];
        phoneNumberRequired?: boolean;
    };
}
