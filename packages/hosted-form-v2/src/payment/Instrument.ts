interface CardInstrument {
    type: 'card';
    name: string;
    number: string;
    expires: {
        month: number;
        year: number;
    };
    verification_value?: string;
}

interface ManualPaymentInstrument {
    type: 'manual_payment';
    note: string;
}

export type Instrument = CardInstrument | ManualPaymentInstrument;
