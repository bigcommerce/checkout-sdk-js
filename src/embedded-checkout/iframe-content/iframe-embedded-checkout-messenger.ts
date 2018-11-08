import { isCustomError, CustomError } from '../../common/error/errors';
import {
    EmbeddedCheckoutCompleteEvent,
    EmbeddedCheckoutError,
    EmbeddedCheckoutErrorEvent,
    EmbeddedCheckoutEvent,
    EmbeddedCheckoutEventType,
    EmbeddedCheckoutFrameErrorEvent,
    EmbeddedCheckoutFrameLoadedEvent,
    EmbeddedCheckoutLoadedEvent,
    EmbeddedCheckoutSignedOutEvent,
} from '../embedded-checkout-events';
import EmbeddedCheckoutStyles from '../embedded-checkout-styles';
import IframeEventListener from '../iframe-event-listener';
import IframeEventPoster from '../iframe-event-poster';

import EmbeddedCheckoutMessenger from './embedded-checkout-messenger';
import { EmbeddedContentEventMap, EmbeddedContentEventType } from './embedded-content-events';

export default class IframeEmbeddedCheckoutMessenger implements EmbeddedCheckoutMessenger {
    /**
     * @internal
     */
    constructor(
        private _messageListener: IframeEventListener<EmbeddedContentEventMap>,
        private _messagePoster: IframeEventPoster<EmbeddedCheckoutEvent>
    ) {
        this._messageListener.listen();
    }

    postComplete(): void {
        const message: EmbeddedCheckoutCompleteEvent = {
            type: EmbeddedCheckoutEventType.CheckoutComplete,
        };

        this._messagePoster.post(message);
    }

    postError(payload: Error | CustomError): void {
        const message: EmbeddedCheckoutErrorEvent = {
            type: EmbeddedCheckoutEventType.CheckoutError,
            payload: this._transformError(payload),
        };

        this._messagePoster.post(message);
    }

    postFrameError(payload: Error | CustomError): void {
        const message: EmbeddedCheckoutFrameErrorEvent = {
            type: EmbeddedCheckoutEventType.FrameError,
            payload: this._transformError(payload),
        };

        this._messagePoster.post(message);
    }

    postFrameLoaded(): void {
        const message: EmbeddedCheckoutFrameLoadedEvent = {
            type: EmbeddedCheckoutEventType.FrameLoaded,
        };

        this._messagePoster.post(message);
    }

    postLoaded(): void {
        const message: EmbeddedCheckoutLoadedEvent = {
            type: EmbeddedCheckoutEventType.CheckoutLoaded,
        };

        this._messagePoster.post(message);
    }

    postSignedOut(): void {
        const message: EmbeddedCheckoutSignedOutEvent = {
            type: EmbeddedCheckoutEventType.SignedOut,
        };

        this._messagePoster.post(message);
    }

    receiveStyles(handler: (styles: EmbeddedCheckoutStyles) => void): void {
        this._messageListener.addListener(EmbeddedContentEventType.StyleConfigured, ({ payload }) => {
            handler(payload);
        });
    }

    private _transformError(error: Error | CustomError): EmbeddedCheckoutError {
        return {
            message: error.message,
            type: isCustomError(error) ? error.type : undefined,
            subtype: isCustomError(error) ? error.subtype : undefined,
        };
    }
}
