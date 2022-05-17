type TotalPriceStatus = 'ESTIMATED' | 'FINAL' | 'NOT_CURRENTLY_KNOWN';
type AddressFormat = 'FULL' | 'MIN';

export interface GooglePayBraintreeDataRequest {
    merchantInfo: {
        authJwt?: string;
        merchantId?: string;
        merchantName?: string;
    };
    transactionInfo: {
        currencyCode: string;
        totalPriceStatus: TotalPriceStatus;
        totalPrice: string;
    };
    cardRequirements: {
        billingAddressRequired: boolean;
        billingAddressFormat: AddressFormat;
    };
    emailRequired: boolean;
    phoneNumberRequired: boolean;
    shippingAddressRequired: boolean;
}

export interface GooglePayBraintreePaymentDataRequestV1 {
    allowedPaymentMethods: string[];
    apiVersion: number;
    cardRequirements: {
        allowedCardNetworks: string[];
        billingAddressFormat: string;
        billingAddressRequired: boolean;
    };
    environment: string;
    i: {
        googleTransactionId: string;
        startTimeMs: number;
    };
    merchantInfo: {
        merchantId: string;
        merchantName: string;
        authJwt?: string;
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
    phoneNumberRequired: boolean;
    transactionInfo: {
        currencyCode: string;
        totalPrice: string;
        totalPriceStatus: string;
    };
}
