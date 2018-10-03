export enum EmbeddedCheckoutEventType {
    CheckoutComplete = 'CHECKOUT_COMPLETE',
    CheckoutError = 'CHECKOUT_ERROR',
    CheckoutLoaded = 'CHECKOUT_LOADED',
    FrameError = 'FRAME_ERROR',
    FrameLoaded = 'FRAME_LOADED',
}

export interface EmbeddedCheckoutEventMap {
    [EmbeddedCheckoutEventType.CheckoutComplete]: EmbeddedCheckoutCompleteEvent;
    [EmbeddedCheckoutEventType.CheckoutError]: EmbeddedCheckoutErrorEvent;
    [EmbeddedCheckoutEventType.CheckoutLoaded]: EmbeddedCheckoutLoadedEvent;
    [EmbeddedCheckoutEventType.FrameError]: EmbeddedCheckoutFrameErrorEvent;
    [EmbeddedCheckoutEventType.FrameLoaded]: EmbeddedCheckoutFrameLoadedEvent;
}

export type EmbeddedCheckoutEvent = (
    EmbeddedCheckoutCompleteEvent |
    EmbeddedCheckoutErrorEvent |
    EmbeddedCheckoutFrameErrorEvent |
    EmbeddedCheckoutFrameLoadedEvent |
    EmbeddedCheckoutLoadedEvent
);

export interface EmbeddedCheckoutCompleteEvent {
    type: EmbeddedCheckoutEventType.CheckoutComplete;
}

export interface EmbeddedCheckoutErrorEvent {
    type: EmbeddedCheckoutEventType.CheckoutError;
    payload: EmbeddedCheckoutError;
}

export interface EmbeddedCheckoutLoadedEvent {
    type: EmbeddedCheckoutEventType.CheckoutLoaded;
}

export interface EmbeddedCheckoutFrameErrorEvent {
    type: EmbeddedCheckoutEventType.FrameError;
    payload: EmbeddedCheckoutError;
}

export interface EmbeddedCheckoutFrameLoadedEvent {
    type: EmbeddedCheckoutEventType.FrameLoaded;
}

export interface EmbeddedCheckoutError {
    message: string;
    type?: string;
    subtype?: string;
}
