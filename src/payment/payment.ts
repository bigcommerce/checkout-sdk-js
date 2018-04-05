export default interface Payment {
    name: string;
    paymentData?: PaymentInstrument;
    gateway?: string;
    source?: string;
}

export type PaymentInstrument = CreditCard | TokenizedCreditCard | VaultedInstrument;

export interface CreditCard {
    ccExpiry: {
        month: string,
        year: string,
    };
    ccName: string;
    ccNumber: string;
    ccType: string;
    ccCvv?: string;
    deviceSessionId?: string;
    shouldSaveInstrument?: boolean;
}

export interface TokenizedCreditCard {
    nonce: string;
    deviceSessionId?: string;
}

export interface VaultedInstrument {
    instrumentId: string;
    cvv?: number;
}
