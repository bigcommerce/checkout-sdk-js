export const SignatureValidationErrors = [100004, 1010, 1011, 1020];

export interface CyberSourceCardinal {
    configure(params: CardinalConfiguration): void;
    on(params: CardinalEventType, callback: CardinalEventMap[CardinalEventType]): void;
    off(params: CardinalEventType): void;
    setup(initializationType: CardinalInitializationType, initializationData: CardinalInitializationDataMap[CardinalInitializationType]): void;
    trigger(event: CardinalTriggerEvents, data?: string): Promise<CardinalBinProcessResponse | void>;
    continue(paymentBrand: CardinalPaymentBrand, continueObject: ContinueObject, order: PartialOrder): void;
}

export interface CardinalWindow extends Window {
    Cardinal?: CyberSourceCardinal;
}

export enum CardinalEventType {
    SetupCompleted = 'payments.setupComplete',
    Validated = 'payments.validated',
}

export interface CardinalEventMap {
    [CardinalEventType.SetupCompleted](setupCompleteData: SetupCompletedData): void;
    [CardinalEventType.Validated](data: CardinalValidatedData, jwt?: string): void;
}

export type CardinalConfiguration = Partial<{
    logging?: {
        level: string,
    };
    payment?: {
        view?: string,
        framework?: string,
        displayLoading?: boolean,
    };
}>;

export interface SetupCompletedData {
    sessionId: string;
    modules: ModuleState[];
}

export interface ModuleState {
    loaded: boolean;
    module: string;
}

export enum CardinalInitializationType {
    Init = 'init',
    Complete = 'complete',
    Confirm = 'confirm',
}

export interface CardinalInitializationDataMap {
    [CardinalInitializationType.Init]: InitTypeData;
    [CardinalInitializationType.Complete]: CompleteTypeData;
    [CardinalInitializationType.Confirm]: ConfirmTypeData;
}

export interface InitTypeData {
    jwt: string;
}

export interface CompleteTypeData {
    Status: string;
}

export interface ConfirmTypeData {
    jwt: string;
    cardinalResponseJwt: string;
}

export enum CardinalValidatedAction {
    SUCCESS = 'SUCCESS',
    NOACTION = 'NOACTION',
    FAILURE = 'FAILURE',
    ERROR = 'ERROR',
}

export interface CardinalValidatedData {
    ActionCode: CardinalValidatedAction;
    ErrorDescription: string;
    ErrorNumber: number;
    Validated: boolean;
    Payment?: Payment;
}

export interface Payment {
    ProcessorTransactionId: string;
    Type: PaymentType;
}

export enum PaymentType {
    CCA = 'CCA',
    Paypal = 'Paypal',
    Wallet = 'Wallet',
    VisaCheckout = 'VisaCheckout',
    ApplePay = 'ApplePay',
    DiscoverWallet = 'DiscoverWallet',
}

export enum CardinalTriggerEvents {
    BIN_PROCESS = 'bin.process',
}

export interface CardinalBinProcessResponse {
    Status: boolean;
}

export enum CardinalPaymentBrand {
    CCA = 'cca',
}

export interface ContinueObject {
    AcsUrl: string;
    Payload: string;
}

export interface PartialOrder {
    OrderDetails: OrderDetails;
}

export interface OrderDetails {
    OrderNumber?: string;
    Amount?: number;
    CurrencyCode?: string;
    OrderChannel?: string;
    TransactionId: string;
}

export enum CardinalPaymentStep {
    SETUP = 'setup',
    AUTHORIZATION = 'authorization',
}

export enum CardinalEventAction {
    ERROR = 'error',
    OK = 'ok',
}

export interface CardinalEventResponse {
    type: {
        step: CardinalPaymentStep;
        action: CardinalEventAction;
    };
    jwt?: string;
    data?: CardinalValidatedData;
    status: boolean;
}

export interface JPMC {
    CyberSourceCardinal: CyberSourceCardinal;
}
