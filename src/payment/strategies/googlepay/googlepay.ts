import { AddressRequestBody } from '../../../address/address';
import { BillingAddressUpdateRequestBody } from '../../../billing/billing-address';
import Checkout from '../../../checkout/checkout';
import PaymentMethod from '../../payment-method';
import { BraintreeModule, BraintreeModuleCreator } from '../braintree';

export type EnvironmentType = 'PRODUCTION' | 'TEST';
type AddressFormat = 'FULL' | 'MIN';
type TotalPriceStatus = 'ESTIMATED' | 'FINAL' | 'NOT_CURRENTLY_KNOWN';
type TokenizeType = 'AndroidPayCard' | 'CreditCard';
export const GATEWAY = { braintree: 'braintree' };

export interface GooglePayBraintreeSDK extends BraintreeModule {
    createPaymentDataRequest(request?: GooglePayDataRequestV1): { allowedPaymentMethods: string[] } | GooglePayPaymentDataRequestV1;
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
    payments: any;
}

export enum ButtonType {
    long = 'long',
    short = 'short',
}
export enum ButtonColor {
    default = 'default',
    black = 'black',
    white = 'white',
}

export interface GooglePayClient {
    isReadyToPay(options: object): Promise<GooglePayIsReadyToPayResponse>;
    loadPaymentData(paymentDataRequest: any): Promise<GooglePaymentData>;
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

export default function mapGooglePayAddressToRequestAddress(address: GooglePayAddress, id?: string): AddressRequestBody | BillingAddressUpdateRequestBody {
    return {
        id,
        firstName: address.name.split(' ').slice(0, -1).join(' '),
        lastName: address.name.split(' ').slice(-1).join(' '),
        company: address.companyName,
        address1: address.address1,
        address2: address.address2 + address.address3 + address.address4 + address.address5,
        city: address.locality,
        stateOrProvince: address.administrativeArea,
        stateOrProvinceCode: address.administrativeArea,
        postalCode: address.postalCode,
        countryCode: address.countryCode,
        phone: address.phoneNumber,
        customFields: [],
    };
}

export interface GooglePayInitializer {
    initialize(checkout: Checkout, paymentMethod: PaymentMethod, hasShippingAddress: boolean, publishableKey?: string): Promise<GooglePayPaymentDataRequestV1>;
    teardown(): Promise<void>;
    parseResponse(paymentData: any): Promise<TokenizePayload>;
}
