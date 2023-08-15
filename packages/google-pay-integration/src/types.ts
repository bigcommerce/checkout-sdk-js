export interface GooglePayGatewayBaseRequest {
    apiVersion: 2;
    apiVersionMinor: 0;
}

type GooglePayGatewayBaseResponse = GooglePayGatewayBaseRequest;

interface GooglePayPaymentMethod<T> {
    type: string;
    parameters: T;
}

type GooglePayAuthMethod = 'PAN_ONLY' | 'CRYPTOGRAM_3DS';

export enum GooglePayCardNetwork {
    AMEX = 'AMEX',
    DISCOVER = 'DISCOVER',
    INTERAC = 'INTERAC',
    JCB = 'JCB',
    MC = 'MASTERCARD',
    VISA = 'VISA',
}

export interface GooglePayCardParameters {
    allowedAuthMethods: GooglePayAuthMethod[];
    allowedCardNetworks: GooglePayCardNetwork[];
    billingAddressRequired?: boolean;
    billingAddressParameters?: {
        format?: 'MIN' | 'FULL';
        phoneNumberRequired?: boolean;
    };
}

export interface GooglePayBaseCardPaymentMethod
    extends GooglePayPaymentMethod<GooglePayCardParameters> {
    type: 'CARD';
    parameters: GooglePayCardParameters;
}

export interface GooglePayIsReadyToPayRequest extends GooglePayGatewayBaseRequest {
    allowedPaymentMethods: [GooglePayBaseCardPaymentMethod];
}

interface GooglePayGatewayBaseParameters {
    gateway: string;
}

export interface GooglePayRegularGatewayParameters extends GooglePayGatewayBaseParameters {
    gatewayMerchantId: string;
}

export interface GooglePayStripeGatewayParameters extends GooglePayGatewayBaseParameters {
    'stripe:version'?: string;
    'stripe:publishableKey'?: string;
}

export type GooglePayGatewayParameters =
    | GooglePayRegularGatewayParameters
    | GooglePayStripeGatewayParameters;

export interface GooglePayCardPaymentMethod extends GooglePayBaseCardPaymentMethod {
    tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY';
        parameters: GooglePayGatewayParameters;
    };
}

export interface GooglePayTransactionInfo {
    /** [!] Required for EEA countries */
    countryCode?: string;
    currencyCode: string;
    totalPriceStatus: 'FINAL';
    totalPrice: string;
}

export interface GooglePayMerchantInfo {
    merchantName: string;
    merchantId: string;
    authJwt: string;
}

export interface GooglePayPaymentDataRequest extends GooglePayGatewayBaseRequest {
    allowedPaymentMethods: [GooglePayCardPaymentMethod];
    transactionInfo: GooglePayTransactionInfo;
    merchantInfo: GooglePayMerchantInfo;
    emailRequired?: boolean;
    shippingAddressRequired?: boolean;
    shippingAddressParameters?: {
        allowedCountryCodes: string[];
        phoneNumberRequired?: boolean;
    };
}

interface GooglePayMinBillingAddress {
    name: string;
    postalCode: string;
    countryCode: string;
    phoneNumber?: string;
}

export interface GooglePayFullBillingAddress extends GooglePayMinBillingAddress {
    address1: string;
    address2: string;
    address3: string;
    locality: string;
    administrativeArea: string;
    sortingCode: string;
}

interface GooglePayCardInfo {
    cardNetwork: GooglePayCardNetwork;
    cardDetails: string;
    billingAddress?: GooglePayFullBillingAddress;
}

interface GooglePayPaymentMethodData<T> {
    description: string;
    tokenizationData: {
        type: 'PAYMENT_GATEWAY';
        token: string;
    };
    type: string;
    info: T;
}

interface GooglePayCardData extends GooglePayPaymentMethodData<GooglePayCardInfo> {
    type: 'CARD';
}

interface GooglePayPaymentDataResponse<T> extends GooglePayGatewayBaseResponse {
    paymentMethodData: GooglePayPaymentMethodData<T>;
    shippingAddress?: GooglePayFullBillingAddress;
    email?: string;
}

export interface GooglePayCardDataResponse extends GooglePayPaymentDataResponse<GooglePayCardInfo> {
    paymentMethodData: GooglePayCardData;
}

interface GooglePayIsReadyToPayResponse {
    result: boolean;
}

export interface GooglePayButtonOptions {
    onClick: (event: MouseEvent) => void;
    allowedPaymentMethods: [GooglePayBaseCardPaymentMethod];
}

export interface GooglePaymentsClient {
    isReadyToPay(request: GooglePayIsReadyToPayRequest): Promise<GooglePayIsReadyToPayResponse>;
    createButton(options: GooglePayButtonOptions): HTMLElement;
    loadPaymentData(request: GooglePayPaymentDataRequest): Promise<GooglePayCardDataResponse>;
    prefetchPaymentData(request: GooglePayPaymentDataRequest): void;
}

type GooglePayEnvironment = 'TEST' | 'PRODUCTION';

type GooglePaymentsClientConstructor = new (paymentOptions: {
    environment: GooglePayEnvironment;
}) => GooglePaymentsClient;

export interface GooglePayHostWindow extends Window {
    google?: {
        payments: {
            api: {
                PaymentsClient: GooglePaymentsClientConstructor;
            };
        };
    };
}

interface GooglePayBaseInitializationData {
    card_information?: { type: string; number: string };
    gateway: string;
    gatewayMerchantId?: string;
    googleMerchantId: string;
    googleMerchantName: string;
    isThreeDSecureEnabled: boolean;
    nonce?: string;
    platformToken: string;
    storeCountry?: string;
}

export interface GooglePayAuthorizeNetInitializationData extends GooglePayBaseInitializationData {
    paymentGatewayId: string;
}

export interface GooglePayStripeInitializationData extends GooglePayBaseInitializationData {
    stripeConnectedAccount: string;
    stripePublishableKey: string;
    stripeVersion: string;
}

export interface GooglePayCheckoutComInitializationData extends GooglePayBaseInitializationData {
    checkoutcomkey: string;
}

export type GooglePayInitializationData =
    | GooglePayBaseInitializationData
    | GooglePayAuthorizeNetInitializationData
    | GooglePayStripeInitializationData
    | GooglePayCheckoutComInitializationData;

export interface GooglePaySetExternalCheckoutData {
    nonce: string;
    card_information: { type: string; number: string };
}

export interface GooglePayAdditionalActionProcessable {
    processAdditionalAction(error: unknown): Promise<void>;
}

export interface GooglePayErrorObject {
    errorCode?: number;
    statusCode: 'CANCELED' | 'DEVELOPER_ERROR';
    statusMessage?: string;
}

export interface GooglePayTokenObject {
    protocolVersion: string;
    signature: string;
    signedMessage: string;
}

export interface GooglePayStripeTokenObject {
    id: string;
}

export interface GooglePayCheckoutComTokenObject {
    token: string;
}

export interface GooglePayThreeDSecureResult {
    three_ds_result: {
        acs_url: string;
        code: string;
    };
}
