export interface CyberSourceCardinal {
    configure(params: CardinalConfiguration): void;
    on(params: CardinalEventType, callback: CardinalEventMap[CardinalEventType]): void;
    setup(initializationType: CardinalInitializationType, initializationData: CardinalInitializatinDataMap[CardinalInitializationType]): void;
    trigger(event: CardinalTriggerEvents, data?: string): Promise<CardinalBinProccessResponse | void>;
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
    [CardinalEventType.SetupCompleted](setupCompleteData: SetupCompleteData): void;
    [CardinalEventType.Validated](data: CardinalValidatedData, jwt?: string): void;
}

export type CardinalConfiguration = Partial<{
    logging?: {
        level: string,
    };
    payment?: {
        view: string,
        framework?: string,
        displayLoading?: boolean,
    };
}>;

export interface SetupCompleteData {
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

export interface CardinalInitializatinDataMap {
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
    SUCCCESS = 'SUCCESS',
    NOACTION = 'NOACTION',
    FAILURE = 'FAILURE',
    ERROR = 'ERROR',
}

export type CardinalValidatedData = Partial<{
    ActionCode: CardinalValidatedAction;
    ErrorDescription: string;
    ErrorNumber: number;
    Validated: boolean;
}>;

export enum CardinalTriggerEvents {
    ACCOUNT_NUMBER_UPDATE = 'accountNumber.update',
    BIN_PROCCESS = 'bin.process',
    JWT_UPDATE = 'jwt.update',
    ORDER_UPDATE = 'order.update',
}

export interface CardinalBinProccessResponse {
    Status: string;
}

export enum CardinalPaymentBrand {
    CCA = 'cca',
}

export interface ContinueObject {
    AcsUrl: string;
    Payload: string;
}

export interface PartialOrder {
    OrderDetails: Orderdetails;
}

export interface Orderdetails {
    OrderNumber?: string;
    Amount?: number;
    CurrencyCode?: string;
    OrderChannel?: string;
    TransactionId: string;
}

export interface CardinalEventResponse {
    eventType: CardinalEventType;
    jwt?: string;
    data?: CardinalValidatedData;
}
