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

export interface ChasePayInitializeOptions {
    /**
     * This container is used to host the chasepay branding logo.
     * It should be an HTML element.
     */
    logoContainer: string;

    /**
     * This walletButton is used to set an event listener, provide an element ID if you want
     * users to be able to launch the ChasePay wallet modal by clicking on a button.
     * It should be an HTML element.
     */
    walletButton?: string;

    /**
     * A callback that gets called when the customer selects a payment option.
     */
    onPaymentSelect?(): void;
}
