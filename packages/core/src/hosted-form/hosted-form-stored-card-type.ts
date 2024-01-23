export interface HostedFormStoredCardData {
    currencyCode: string;
    paymentsUrl: string;
    providerId: string;
    shopperId: string;
    storeHash: string;
    vaultToken: string;
}

export interface HostedFormStoredCardPaymentInstrument {
    type: string;
    cardholderName: string;
    number: string;
    expiryMonth: number;
    expiryYear: number;
    verificationValue: string;
}

export interface HostedFormStoredCardBillingAddress {
    address1: string;
    address2?: string;
    city: string;
    postalCode: string;
    countryCode: string;
    company?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    stateOrProvinceCode?: string;
}

export interface HostedFormStoredCardInstrumentForm {
    billingAddress: HostedFormStoredCardBillingAddress;
    instrument: HostedFormStoredCardPaymentInstrument;
    defaultInstrument: boolean;
}

export interface HostedFormStoredCardInstrumentFields extends HostedFormStoredCardBillingAddress {
    defaultInstrument: boolean;
}

export interface HostedFormStoredCardPayload {
    fields: HostedFormStoredCardInstrumentFields;
    data: HostedFormStoredCardData;
}
