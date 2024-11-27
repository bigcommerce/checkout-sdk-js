export enum InstrumentType {
    Card = 'card',
    ManualPayment = 'manual_payment',
}

export enum OfflinePaymentMethodId {
    BankDeposit = 'bigcommerce_offline.bank_deposit',
    Cheque = 'bigcommerce_offline.cheque',
    Cod = 'bigcommerce_offline.cod',
    InStore = 'bigcommerce_offline.in_store',
    MoneyOrder = 'bigcommerce_offline.money_order',
}

export enum OfflinePaymentMethodType {
    BankDeposit = 'bank_deposit',
    Cheque = 'cheque',
    Cod = 'cod',
    InStore = 'in_store',
    MoneyOrder = 'money_order',
}

export const offlinePaymentMethodTypeMap: {
    [key in OfflinePaymentMethodId]: OfflinePaymentMethodType;
} = {
    [OfflinePaymentMethodId.BankDeposit]: OfflinePaymentMethodType.BankDeposit,
    [OfflinePaymentMethodId.Cheque]: OfflinePaymentMethodType.Cheque,
    [OfflinePaymentMethodId.Cod]: OfflinePaymentMethodType.Cod,
    [OfflinePaymentMethodId.InStore]: OfflinePaymentMethodType.InStore,
    [OfflinePaymentMethodId.MoneyOrder]: OfflinePaymentMethodType.MoneyOrder,
};

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

interface OfflinePaymentInstrument {
    type: OfflinePaymentMethodType;
}

export type Instrument = CardInstrument | ManualPaymentInstrument | OfflinePaymentInstrument;
