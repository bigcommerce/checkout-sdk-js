export interface StoredCardHostedFormData {
    currencyCode: string;
    paymentsUrl: string;
    providerId: string;
    shopperId: string;
    storeHash: string;
    vaultToken: string;
}

export interface StoredCardHostedFormPaymentInstrument {
    type: string;
    cardholderName: string;
    number: string;
    expiryMonth: number;
    expiryYear: number;
    verificationValue: string;
}

export interface StoredCardHostedFormBillingAddress {
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

export interface StoredCardHostedFormInstrumentForm {
    billingAddress: StoredCardHostedFormBillingAddress;
    instrument: StoredCardHostedFormPaymentInstrument;
    defaultInstrument: boolean;
}

export interface StoredCardHostedFormInstrumentFields extends StoredCardHostedFormBillingAddress {
    defaultInstrument: boolean;
}

export interface StoredCardHostedFormPayload {
    fields: StoredCardHostedFormInstrumentFields;
    data: StoredCardHostedFormData;
}
