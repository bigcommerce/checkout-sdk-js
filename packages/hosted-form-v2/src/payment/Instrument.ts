enum InstrumentType {
    Card = 'card',
    ManualPayment = 'manual_payment',
}

interface CardInstrument {
    type: InstrumentType.Card;
    name: string;
    number: string;
    expires: {
        month: number;
        year: number;
    };
    verification_value?: string;
}

interface ManualPaymentInstrument {
    type: InstrumentType.ManualPayment;
    note: string;
}

export type Instrument = CardInstrument | ManualPaymentInstrument;
