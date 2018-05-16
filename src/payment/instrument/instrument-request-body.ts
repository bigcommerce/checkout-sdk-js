export interface InstrumentBillingAddress {
    addressLine1: string;
    addressLine2: string;
    city: string;
    company: string;
    country: string;
    countryCode: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    postCode: string;
    province: string;
    provinceCode: string;
}

export interface ThreeDSecure {
    version: string;
    status: string;
    vendor: string;
    cavv: string;
    eci: string;
    xid: string;
}

export interface InstrumentCreditCard {
    cardholderName: string;
    number: string;
    month: number;
    year: number;
    verificationCode: string;
    issueMonth: number;
    issueYear: number;
    issueNumber: number;
    trackData: string;
    isManualEntry: boolean;
    iccData: string;
    fallbackReason: string;
    isContactless: boolean;
    encryptedPinCryptogram: string;
    encryptedPinKsn: string;
    threeDSecure: ThreeDSecure;
}

export interface InstrumentRequestBody {
    billingAddress: InstrumentBillingAddress;
    creditCard: InstrumentCreditCard;
    defaultInstrument: boolean;
    providerName: string;
}
