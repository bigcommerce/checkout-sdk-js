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
    cardholder_name: string;
    number: string;
    expiry_month: number;
    expiry_year: number;
    verification_value: string;
}

export interface HostedFormVaultingBillingAddress {
    address1: string;
    address2?: string;
    city: string;
    postal_code: string;
    country_code: string;
    company?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    state_or_province_code?: string;
}

export interface HostedFormVaultingInstrumentForm {
    billingAddress: HostedFormVaultingBillingAddress;
    instrument: HostedFormVaultingPaymentInstrument;
    default_instrument: boolean;
}

export interface HostedFormVaultingInstrumentFields extends HostedFormVaultingBillingAddress {
    default_instrument: boolean;
}

export interface HostedFormVaultingPayload {
    fields: HostedFormVaultingInstrumentFields;
    data: HostedFormVaultingData;
}
