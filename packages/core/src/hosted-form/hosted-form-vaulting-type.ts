export interface HostedFormVaultingData {
    currencyCode: string;
    paymentsUrl: string;
    providerId: string;
    shopperId: string;
    storeHash: string;
    vaultToken: string;
}

export interface HostedFormVaultingPaymentInstrument {
    type: string;
    cardholderName: string;
    number: string;
    expiryMonth: number;
    expiryYear: number;
    verificationValue: string;
}

export interface HostedFormVaultingBillingAddress {
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

export interface HostedFormVaultingInstrumentForm {
    billingAddress: HostedFormVaultingBillingAddress;
    instrument: HostedFormVaultingPaymentInstrument;
    defaultInstrument: boolean;
}

export interface HostedFormVaultingInstrumentFields extends HostedFormVaultingBillingAddress {
    defaultInstrument: boolean;
}

export interface HostedFormVaultingPayload {
    fields: HostedFormVaultingInstrumentFields;
    data: HostedFormVaultingData;
}
