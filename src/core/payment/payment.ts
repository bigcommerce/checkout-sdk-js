export default interface Payment {
    name: string;
    paymentData?: CreditCard | TokenizedCreditCard;
    gateway?: string;
    source?: string;
}

interface CreditCard {
    ccExpiry: {
        month: number,
        year: number,
    };
    ccName: string;
    ccNumber: string;
    ccType: string;
    ccCvv?: number;
    deviceSessionId?: string;
    shouldSaveInstrument?: boolean;
}

interface TokenizedCreditCard {
    nonce: string;
    deviceSessionId?: string;
}
