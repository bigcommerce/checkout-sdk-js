interface BaseInstrument {
    bigpayToken: string;
    defaultInstrument: boolean;
    provider: string;
    trustedShippingAddress: boolean;
    method: string;
    type: string;
}

export enum UntrustedShippingCardVerificationType {
    CVV = 'cvv',
    PAN = 'pan',
}

export interface CardInstrument extends BaseInstrument {
    brand: string;
    expiryMonth: string;
    expiryYear: string;
    iin: string;
    last4: string;
    type: 'card';
    untrustedShippingCardVerificationMode: UntrustedShippingCardVerificationType;
}
