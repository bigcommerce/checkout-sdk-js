export default interface Payment {
    methodId: string;
    gatewayId?: string;
    paymentData?: PaymentInstrument & PaymentInstrumentMeta;
}

export type PaymentInstrument = CreditCardInstrument | NonceInstrument | VaultedInstrument | CryptogramInstrument;

export interface PaymentInstrumentMeta {
    deviceSessionId?: string;
}

export interface CreditCardInstrument {
    ccCustomerCode?: string;
    ccExpiry: {
        month: string,
        year: string,
    };
    ccName: string;
    ccNumber: string;
    ccCvv?: string;
    shouldSaveInstrument?: boolean;
    extraData?: any;
}

export interface NonceInstrument {
    nonce: string;
    deviceSessionId?: string;
}

export interface VaultedInstrument {
    instrumentId: string;
    ccCvv?: string;
    ccNumber?: string;
}

export interface CryptogramInstrument {
    cryptogramId: string;
    eci: string;
    transactionId?: string;
    ccExpiry: {
        month: string,
        year: string,
    };
    ccNumber: string;
    accountMask: string;
    extraData?: any;
}

export type ThreeDSecure = Partial<{
    version: string;
    status: string;
    vendor: string;
    cavv: string;
    eci: string;
    xid: string;
    token: string;
    session: string;
}>;
