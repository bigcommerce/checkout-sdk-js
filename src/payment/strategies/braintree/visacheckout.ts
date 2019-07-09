export interface VisaCheckoutAddress {
    countryCode?: string;
    extendedAddress?: string;
    firstName?: string;
    lastName?: string;
    locality?: string;
    postalCode?: string;
    region?: string;
    streetAddress?: string;
    phoneNumber?: string;
}

export interface VisaCheckoutUserData {
    userEmail: string;
    userFirstName: string;
    userLastName: string;
    userFullName: string;
    userName: string;
}

export interface VisaCheckoutTokenizedPayload {
    nonce: string;
    details: {
        cardType: string;
        lastFour: string;
        lastTwo: string;
    };
    description: string;
    type: string;
    billingAddress: VisaCheckoutAddress;
    shippingAddress?: VisaCheckoutAddress;
    userData: VisaCheckoutUserData;
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

export interface VisaCheckoutEventMap {
    'payment.success'(payment: VisaCheckoutPaymentSuccessPayload): void;
    'payment.error'(payment: VisaCheckoutPaymentSuccessPayload, Error: Error): void;
}

export interface VisaCheckoutSDK {
    init(options: VisaCheckoutInitOptions): {};
    on<VisaCheckoutEventType extends keyof VisaCheckoutEventMap>(eventType: VisaCheckoutEventType, callback: VisaCheckoutEventMap[VisaCheckoutEventType]): {};
}

export type VisaCheckoutCardType = 'VISA' | 'MASTERCARD' | 'AMEX' | 'DISCOVER' | 'ELECTRON' | 'ELO';

export interface VisaCheckoutInitOptions {
    apikey: string;
    referenceCallID?: string;
    externalProfileId?: string;
    externalClientId?: string;
    settings?: {
        locale?: string;
        countryCode?: string;
        displayName?: string;
        websiteUrl?: string;
        customerSupportUrl?: string;
        shipping?: {
            acceptedRegions?: string;
            collectShipping?: boolean;
        };
        review?: {
            message?: string;
            buttonAction?: 'Continue' | 'Pay';
        };
        payment?: {
            cardBrands?: VisaCheckoutCardType[];
            acceptCanadianVisaDebit?: boolean;
            billingCountries?: string;
        };
        threeDSSetup?: {
            threeDSActive?: false;
            threeDSSuppressChallenge?: boolean;
        };
        dataLevel?: 'SUMMARY' | 'FULL' | 'NONE';
        currencyFormat?: string;
        enableUserDataPrefill?: boolean;
    };
    paymentRequest: {
        merchantRequestId?: string;
        currencyCode?: string;
        subtotal: string;
        shippingHandling?: string;
        tax?: string;
        discount?: string;
        giftWrap?: string;
        misc?: string;
        total?: string;
        orderId?: string;
        description?: string;
        promoCode?: string;
        customData?: {
            [key: string]: any;
        };
    };
}

export interface VisaCheckoutPaymentSuccessPayload {
    callid: string;
    responseStatus: VisaCheckoutResponseStatus;
    encKey: string;
    encPaymentData: string;
    partialShippingAddress: {
        countryCode: string;
        postalCode: string;
    };
    paymentMethodType: 'PAN' | 'TOKEN';

}

export interface VisaCheckoutPaymentCancelledPayload {
    callid: string;
}

export interface VisaCheckoutResponseStatus {
    status: number;
    code: number;
    severity?: 'ERROR' | 'WARNING';
    message: string;
}

export interface VisaCheckoutHostWindow extends Window {
    V?: VisaCheckoutSDK;
}
