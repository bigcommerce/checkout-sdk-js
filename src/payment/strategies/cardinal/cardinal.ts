export const CardinalSignatureValidationErrors = [100004, 1010, 1011, 1020];

export interface CardinalSDK {
    configure(params: CardinalConfiguration): void;
    on(params: CardinalEventType, callback: CardinalEventMap[CardinalEventType]): void;
    off(params: CardinalEventType): void;
    setup<K extends keyof CardinalInitializationDataMap>(initializationType: K, initializationData: CardinalInitializationDataMap[K]): void;
    trigger(event: CardinalTriggerEvents, data?: string): Promise<CardinalBinProcessResponse | void>;
    continue(paymentBrand: CardinalPaymentBrand, continueObject: CardinalContinue, order: CardinalPartialOrder): void;
    start(paymentBrand: CardinalPaymentBrand, order: CardinalPartialOrder, jwt?: string): void;
}

export interface CardinalWindow extends Window {
    Cardinal?: CardinalSDK;
}

export interface CardinalEventMap {
    [CardinalEventType.SetupCompleted](setupCompleteData: CardinalSetupCompletedData): void;
    [CardinalEventType.Validated](data: CardinalValidatedData, jwt?: string): void;
}

export type CardinalConfiguration = Partial<{
    logging: {
        level: string;
    };
    payment: {
        view: string;
        framework: string;
        displayLoading: boolean;
    };
}>;

export interface CardinalSetupCompletedData {
    sessionId: string;
    modules: CardinalModuleState[];
}

export interface CardinalModuleState {
    loaded: boolean;
    module: string;
}

export enum CardinalInitializationType {
    Init = 'init',
    Complete = 'complete',
    Confirm = 'confirm',
}

export interface CardinalInitializationDataMap {
    [CardinalInitializationType.Init]: CardinalInitTypeData;
    [CardinalInitializationType.Complete]: CardinalCompleteTypeData;
    [CardinalInitializationType.Confirm]: CardinalConfirmTypeData;
}

export interface CardinalInitTypeData {
    jwt: string;
}

export interface CardinalCompleteTypeData {
    Status: string;
}

export interface CardinalConfirmTypeData {
    jwt: string;
    cardinalResponseJwt: string;
}

export interface CardinalValidatedData {
    ActionCode?: CardinalValidatedAction;
    ErrorDescription: string;
    ErrorNumber: number;
    Validated: boolean;
    Payment?: CardinalPayment;
}

export interface CardinalPayment {
    ExtendedData?: CardinalCCAExtendedData;
    ProcessorTransactionId: string;
    Type: CardinalPaymentType;
}

export interface CardinalBinProcessResponse {
    Status: boolean;
}

export interface CardinalContinue {
    AcsUrl: string;
    Payload: string;
}

export interface CardinalPartialOrder {
    OrderDetails: CardinalOrderDetails;
    Consumer?: CardinalConsumer;
}

export interface CardinalConsumer {
    Email1?: string;
    Email2?: string;
    ShippingAddress?: CardinalAddress;
    BillingAddress?: CardinalAddress;
    Account?: CardinalAccount;
}

export interface CardinalAccount {
    AccountNumber: number;
    ExpirationMonth: number;
    ExpirationYear: number;
    NameOnAccount: string;
    CardCode: number;
}

export interface CardinalAddress {
    FullName?: string;
    FirstName: string;
    MiddleName?: string;
    LastName: string;
    Address1: string;
    Address2?: string;
    Address3?: string;
    City: string;
    State: string;
    PostalCode: string;
    CountryCode: string;
    Phone1?: string;
    Phone2?: string;
}

export interface CardinalOrderDetails {
    OrderNumber: string;
    Amount: number;
    CurrencyCode: string;
    OrderDescription?: string;
    OrderChannel: string;
    TransactionId?: string;
}

export type CardinalCCAExtendedData = Partial<{
    CAVV: string;
    ECIFlag: string;
    PAResStatus: string;
    SignatureVerification: string;
    XID: string;
    UCAFIndicator: string;
}>;

export enum CardinalEventType {
    SetupCompleted = 'payments.setupComplete',
    Validated = 'payments.validated',
}

export enum CardinalValidatedAction {
    Success = 'SUCCESS',
    NoAction = 'NOACTION',
    Failure = 'FAILURE',
    Error = 'ERROR',
}

export enum CardinalPaymentType {
    CCA = 'CCA',
    Paypal = 'Paypal',
    Wallet = 'Wallet',
    VisaCheckout = 'VisaCheckout',
    ApplePay = 'ApplePay',
    DiscoverWallet = 'DiscoverWallet',
}

export enum CardinalTriggerEvents {
    BinProcess = 'bin.process',
}

export enum CardinalPaymentBrand {
    CCA = 'cca',
}

export enum CardinalSignatureVerification {
    Yes = 'Y',
    No = 'N',
}
