export default interface Payment {
    name: string;
    paymentData?: CreditCard | TokenizedCreditCard;
    gateway?: string;
    source?: string;
}

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
