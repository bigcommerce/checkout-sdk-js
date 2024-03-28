import { PaymentInitializeOptions } from '../..';
import { Checkout, InternalCheckoutSelectors } from '../../../checkout';
import PaymentMethod from '../../payment-method';
import { BraintreeVerifyPayload } from '../braintree';

export enum CallbackTriggerType {
    INITIALIZE = 'INITIALIZE',
    SHIPPING_OPTION = 'SHIPPING_OPTION',
    SHIPPING_ADDRESS = 'SHIPPING_ADDRESS',
    OFFER = 'OFFER',
}

export enum TotalPriceStatusType {
    ESTIMATED = 'ESTIMATED',
    FINAL = 'FINAL',
    NOT_CURRENTLY_KNOWN = 'NOT_CURRENTLY_KNOWN',
}

export enum CallbackIntentsType {
    OFFER = 'OFFER',
    PAYMENT_AUTHORIZATION = 'PAYMENT_AUTHORIZATION',
    SHIPPING_ADDRESS = 'SHIPPING_ADDRESS',
    SHIPPING_OPTION = 'SHIPPING_OPTION',
}

export type EnvironmentType = 'PRODUCTION' | 'TEST';
export type TokenizeType = 'AndroidPayCard' | 'CreditCard' | 'CARD';

export interface GooglePayInitializer {
    initialize(
        checkout: Checkout | void,
        paymentMethod: PaymentMethod,
        hasShippingAddress: boolean,
        publishableKey?: string,
    ): Promise<GooglePayPaymentDataRequestV2>;
    teardown(): Promise<void>;
    parseResponse(paymentData: GooglePaymentData): Promise<TokenizePayload>;
}

export interface GooglePayProviderProcessor {
    initialize(options: PaymentInitializeOptions): Promise<void>;
    processAdditionalAction(error: unknown): Promise<InternalCheckoutSelectors>;
}

export interface GooglePayPaymentOptions {
    environment: EnvironmentType;
    paymentDataCallbacks?: {
        onPaymentDataChanged(
            intermediatePaymentData: IntermediatePaymentData,
        ): Promise<NewTransactionInfo | void>;
    };
}

export type GooglePayVerifyPayload = BraintreeVerifyPayload | undefined;

export interface GooglePayIsReadyToPayResponse {
    result: boolean;
    paymentMethodPresend?: boolean;
}

export interface GooglePaySDK {
    payments: {
        api: {
            PaymentsClient: new (options: GooglePayPaymentOptions) => GooglePayClient;
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

export interface CardInformation {
    cardType: string;
    lastFour: string;
    lastTwo?: string;
    bin?: string;
}

export interface TokenizePayload {
    nonce: string;
    tokenFormat?: string;
    details: CardInformation;
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
        type: TokenizeType;
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
            bin: string;
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
    allowedPaymentMethods: [
        {
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
        },
    ];
    transactionInfo: {
        currencyCode: string;
        countryCode?: string;
        totalPriceStatus?: TotalPriceStatusType;
        totalPrice?: string;
        checkoutOption?: string;
    };
    callbackIntents?: CallbackIntentsType[];
    emailRequired?: boolean;
    shippingAddressRequired?: boolean;
    shippingAddressParameters?: {
        allowedCountryCodes?: string[];
        phoneNumberRequired?: boolean;
    };
}

export interface UpdatePaymentDataRequestPayload {
    apiVersion?: number;
    apiVersionMinor?: number;
    merchantInfo?: {
        authJwt?: string;
        merchantId?: string;
        merchantName?: string;
    };
    allowedPaymentMethods?: [
        {
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
        },
    ];
    transactionInfo?: {
        currencyCode: string;
        countryCode?: string;
        totalPriceStatus?: TotalPriceStatusType;
        totalPrice?: string;
        checkoutOption?: string;
    };
    callbackIntents?: CallbackIntentsType[];
    emailRequired?: boolean;
    shippingAddressRequired?: boolean;
    shippingAddressParameters?: {
        allowedCountryCodes?: string[];
        phoneNumberRequired?: boolean;
    };
}

export interface NewTransactionInfo {
    newTransactionInfo: {
        currencyCode: string;
        totalPrice: string;
        totalPriceStatus: TotalPriceStatusType;
    };
}

export interface IntermediatePaymentData {
    callbackTrigger: CallbackTriggerType;
}

export type GooglePayTransactionInfo = Pick<GooglePayPaymentDataRequestV2, 'transactionInfo'>;
