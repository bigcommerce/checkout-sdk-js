export enum BlueSnapDirectErrorDescription {
    EMPTY = 'empty',
    INVALID = 'invalid',
}

export enum BlueSnapDirectHostedFieldTagId {
    CardCode = 'cvv',
    CardExpiry = 'exp',
    CardNumber = 'ccn',
}

export interface BlueSnapDirectSdk {
    hostedPaymentFieldsCreate(options: unknown): void;
    hostedPaymentFieldsSubmitData(callback: (data: unknown) => void): void;
}

export interface BlueSnapDirectHostWindow extends Window {
    bluesnap?: BlueSnapDirectSdk;
}
