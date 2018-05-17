export default interface Payment {
    name: string;
    paymentData: PaymentInstrument & PaymentInstrumentMeta;
    gateway?: string;
}

export type PaymentInstrument = CreditCardInstrument | NonceInstrument | VaultedInstrument;

export interface PaymentInstrumentMeta {
    deviceSessionId?: string;
}

export interface CreditCardInstrument {
    ccExpiry: {
        month: string,
        year: string,
    };
    ccName: string;
    ccNumber: string;
    ccType: string;
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
    cvv?: number;
}
