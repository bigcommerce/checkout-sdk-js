import { isCustomError, CustomError } from '../../common/error/errors';
import { IframeEventListener, IframeEventPoster } from '../../common/iframe';
import { bindDecorator as bind } from '../../common/utility';
import EmbeddedCheckoutError from '../embedded-checkout-error';
import { EmbeddedCheckoutCompleteEvent, EmbeddedCheckoutErrorEvent, EmbeddedCheckoutEvent, EmbeddedCheckoutEventMap, EmbeddedCheckoutEventType, EmbeddedCheckoutFrameErrorEvent, EmbeddedCheckoutFrameLoadedEvent, EmbeddedCheckoutLoadedEvent, EmbeddedCheckoutSignedOutEvent } from '../embedded-checkout-events';
import EmbeddedCheckoutStyles from '../embedded-checkout-styles';

import EmbeddedCheckoutMessenger from './embedded-checkout-messenger';
import { EmbeddedContentEventMap, EmbeddedContentEventType } from './embedded-content-events';
import EmbeddedContentOptions from './embedded-content-options';

@bind
export default class IframeEmbeddedCheckoutMessenger implements EmbeddedCheckoutMessenger {
    /**
     * @internal
     */
    constructor(
        private _messageListener: IframeEventListener<EmbeddedContentEventMap>,
        private _messagePoster: IframeEventPoster<EmbeddedCheckoutEvent>,
        private _untargetedMessagePoster: IframeEventPoster<EmbeddedCheckoutEvent>,
        private _messageHandlers: EventCallbacks<EmbeddedCheckoutEventMap> = {}
    ) {
        this._messageListener.listen();
    }

    postComplete(): void {
        const message: EmbeddedCheckoutCompleteEvent = {
            type: EmbeddedCheckoutEventType.CheckoutComplete,
        };

        this._postMessage(message);
    }

    postError(payload: Error | CustomError): void {
        const message: EmbeddedCheckoutErrorEvent = {
            type: EmbeddedCheckoutEventType.CheckoutError,
            payload: this._transformError(payload),
        };

        this._postMessage(message);
    }

    postFrameError(payload: Error | CustomError): void {
        const message: EmbeddedCheckoutFrameErrorEvent = {
            type: EmbeddedCheckoutEventType.FrameError,
            payload: this._transformError(payload),
        };

        // Ideally, all messages should be targeted at a specific origin.
        // However, for `FrameError` message, we have to post it in an
        // untargeted fashion. This is because the error could be caused by a
        // missing cart. That makes it not possible to determine of site origin
        // of the parent window. Nevertheless, we still want to notify the
        // parent window about the error.
        this._postMessage(message, { untargeted: true });
    }

    postFrameLoaded(payload?: EmbeddedContentOptions): void {
        const message: EmbeddedCheckoutFrameLoadedEvent = {
            type: EmbeddedCheckoutEventType.FrameLoaded,
            payload,
        };

        this._postMessage(message);
    }

    postLoaded(): void {
        const message: EmbeddedCheckoutLoadedEvent = {
            type: EmbeddedCheckoutEventType.CheckoutLoaded,
        };

        this._postMessage(message);
    }

    postSignedOut(): void {
        const message: EmbeddedCheckoutSignedOutEvent = {
            type: EmbeddedCheckoutEventType.SignedOut,
        };

        this._postMessage(message);
    }

    receiveStyles(handler: (styles: EmbeddedCheckoutStyles) => void): void {
        this._messageListener.addListener(EmbeddedContentEventType.StyleConfigured, ({ payload }) => {
            handler(payload);
        });
    }

    private _postMessage(message: EmbeddedCheckoutEvent, options?: { untargeted?: boolean }): void {
        this._notifyMessageHandlers(message);

        if (options && options.untargeted) {
            return this._untargetedMessagePoster.post(message);
        }

        this._messagePoster.post(message);
    }

    private _notifyMessageHandlers(message: EmbeddedCheckoutEvent): void {
        Object.keys(this._messageHandlers)
            .forEach(key => {
                if (message.type !== key) {
                    return;
                }

                const handler = this._messageHandlers[key];

                if (handler) {
                    (handler as (event: EmbeddedCheckoutEvent) => void).call(null, message);
                }
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

export type EventCallbacks<TEventMap> = {
    [key in keyof TEventMap]?: (event: TEventMap[key]) => void;
};
