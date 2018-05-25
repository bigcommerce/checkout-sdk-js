export interface ChasePayEventMap {
    'START_CHECKOUT'(digitalSessionId: string): void;
    'COMPLETE_CHECKOUT'(): ChasePaySuccessPayload;
    'CANCEL_CHECKOUT'(): void;
}

export interface ChasePayScript {
    ChasePay: JPMC;
}

export interface ChasePayHostWindow extends Window {
    JPMC?: ChasePayScript;
}

export interface ChasePaySuccessPayload {
    sessionToken: string;
}

export interface JPMC {
    EventType: ChasePayEventMap;
    isChasePayUp(): boolean;
    insertButtons(options: any): void;
    on<ChasePayEventType extends keyof ChasePayEventMap>(eventType: ChasePayEventType, callback: ChasePayEventMap[ChasePayEventType]): {};
}
