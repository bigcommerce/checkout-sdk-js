export enum ChasePayEventType {
    StartCheckout = 'startCheckout',
    CompleteCheckout = 'completeCheckout',
    CancelCheckout = 'cancelCheckout',
}

export interface ChasePayEventMap {
    [ChasePayEventType.StartCheckout](digitalSessionId: string): void;
    [ChasePayEventType.CompleteCheckout](payload: ChasePaySuccessPayload): void;
    [ChasePayEventType.CancelCheckout](): void;
}

export interface ChasePayHostWindow extends Window {
    JPMC?: JPMC;
}

export interface JPMC {
    ChasePay: ChasePay;
}

export interface ChasePaySuccessPayload {
    sessionToken: string;
}

export interface ChasePayInsertOptions {
    color?: string;
    containers?: string[];
    height?: number;
    width?: number;
}

export interface ChasePayConfigureOptions {
    language?: string;
    zindex?: number;
    sessionWarningTime?: number;
    sessionTimeoutTime?: number;
}

export interface ChasePay {
    EventType: {
        START_CHECKOUT: ChasePayEventType.StartCheckout;
        COMPLETE_CHECKOUT: ChasePayEventType.CompleteCheckout;
        CANCEL_CHECKOUT: ChasePayEventType.CancelCheckout;
    };
    isChasePayUp(): boolean;
    insertButtons(options: ChasePayInsertOptions): void;
    insertBrandings(options: ChasePayInsertOptions): void;
    startCheckout(digitalSessionId?: string): void;
    showLoadingAnimation(): void;
    configure(options: ChasePayConfigureOptions): void;
    on<ChasePayEventType extends keyof ChasePayEventMap>(eventType: ChasePayEventType, callback: ChasePayEventMap[ChasePayEventType]): {};
}
