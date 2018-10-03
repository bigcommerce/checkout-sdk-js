import {
    EmbeddedCheckoutCompleteEvent,
    EmbeddedCheckoutErrorEvent,
    EmbeddedCheckoutFrameErrorEvent,
    EmbeddedCheckoutFrameLoadedEvent,
    EmbeddedCheckoutLoadedEvent,
} from './embedded-checkout-events';

export default interface EmbeddedCheckoutOptions {
    containerId: string;
    url: string;
    onComplete?(event: EmbeddedCheckoutCompleteEvent): void;
    onError?(event: EmbeddedCheckoutErrorEvent): void;
    onFrameError?(event: EmbeddedCheckoutFrameErrorEvent): void;
    onFrameLoad?(event: EmbeddedCheckoutFrameLoadedEvent): void;
    onLoad?(event: EmbeddedCheckoutLoadedEvent): void;
}
