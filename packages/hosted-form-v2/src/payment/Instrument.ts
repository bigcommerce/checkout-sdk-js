export enum InstrumentType {
    Card = 'card',
    ManualPayment = 'manual_payment',
}

export enum OfflinePaymentMethodIds {
    BankDeposit = 'bigcommerce_offline.bank_deposit',
    Cheque = 'bigcommerce_offline.cheque',
    Cod = 'bigcommerce_offline.cod',
    InStore = 'bigcommerce_offline.in_store',
    MoneyOrder = 'bigcommerce_offline.money_order',
}

export enum OfflinePaymentMethodTypes {
    BankDeposit = 'bank_deposit',
    Cheque = 'cheque',
    Cod = 'cod',
    InStore = 'in_store',
    MoneyOrder = 'money_order',
}

export const offlinePaymentMethodTypeMap: Record<
    OfflinePaymentMethodIds,
    OfflinePaymentMethodTypes
> = {
    [OfflinePaymentMethodIds.BankDeposit]: OfflinePaymentMethodTypes.BankDeposit,
    [OfflinePaymentMethodIds.Cheque]: OfflinePaymentMethodTypes.Cheque,
    [OfflinePaymentMethodIds.Cod]: OfflinePaymentMethodTypes.Cod,
    [OfflinePaymentMethodIds.InStore]: OfflinePaymentMethodTypes.InStore,
    [OfflinePaymentMethodIds.MoneyOrder]: OfflinePaymentMethodTypes.MoneyOrder,
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
    type: OfflinePaymentMethodTypes;
}

export type Instrument = CardInstrument | ManualPaymentInstrument | OfflinePaymentInstrument;
