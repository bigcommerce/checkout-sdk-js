export enum EmbeddedCheckoutEventType {
    CheckoutComplete = 'CHECKOUT_COMPLETE',
    CheckoutError = 'CHECKOUT_ERROR',
    CheckoutLoaded = 'CHECKOUT_LOADED',
    FrameLoaded = 'FRAME_LOADED',
}

export interface EmbeddedCheckoutEventMap {
    [EmbeddedCheckoutEventType.CheckoutComplete]: EmbeddedCheckoutCompleteEvent;
    [EmbeddedCheckoutEventType.CheckoutError]: EmbeddedCheckoutErrorEvent;
    [EmbeddedCheckoutEventType.CheckoutLoaded]: EmbeddedCheckoutLoadedEvent;
    [EmbeddedCheckoutEventType.FrameLoaded]: EmbeddedCheckoutFrameLoadedEvent;
}

export type EmbeddedCheckoutEvent = (
    EmbeddedCheckoutCompleteEvent |
    EmbeddedCheckoutErrorEvent |
    EmbeddedCheckoutFrameLoadedEvent |
    EmbeddedCheckoutLoadedEvent
);

export interface EmbeddedCheckoutCompleteEvent {
    type: EmbeddedCheckoutEventType.CheckoutComplete;
}

export interface EmbeddedCheckoutErrorEvent {
    type: EmbeddedCheckoutEventType.CheckoutError;
    payload: {
        message: string;
        type?: string;
        subtype?: string;
    };
}

export interface EmbeddedCheckoutLoadedEvent {
    type: EmbeddedCheckoutEventType.CheckoutLoaded;
}

export interface EmbeddedCheckoutFrameLoadedEvent {
    type: EmbeddedCheckoutEventType.FrameLoaded;
}
