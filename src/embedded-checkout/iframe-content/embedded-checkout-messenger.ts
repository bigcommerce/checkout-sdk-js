import { isCustomError, CustomError } from '../../common/error/errors';
import {
    EmbeddedCheckoutCompleteEvent,
    EmbeddedCheckoutErrorEvent,
    EmbeddedCheckoutEvent,
    EmbeddedCheckoutEventType,
    EmbeddedCheckoutFrameLoadedEvent,
    EmbeddedCheckoutLoadedEvent,
} from '../embedded-checkout-events';

import EmbeddedCheckoutMessengerOptions from './embedded-checkout-messenger-options';

export default class EmbeddedCheckoutMessenger {
    private _parentOrigin: string;
    private _parentWindow: Window;

    /**
     * @internal
     */
    constructor(
        options: EmbeddedCheckoutMessengerOptions
    ) {
        this._parentOrigin = options.parentOrigin;
        this._parentWindow = options.parentWindow || window.parent;
    }

    postComplete(): void {
        const message: EmbeddedCheckoutCompleteEvent = {
            type: EmbeddedCheckoutEventType.CheckoutComplete,
        };

        this._notifyParent(message);
    }

    postError(payload: Error | CustomError): void {
        const message: EmbeddedCheckoutErrorEvent = {
            type: EmbeddedCheckoutEventType.CheckoutError,
            payload: {
                message: payload.message,
                type: isCustomError(payload) ? payload.type : undefined,
                subtype: isCustomError(payload) ? payload.subtype : undefined,
            },
        };

        this._notifyParent(message);
    }

    postFrameLoaded(): void {
        const message: EmbeddedCheckoutFrameLoadedEvent = {
            type: EmbeddedCheckoutEventType.FrameLoaded,
        };

        this._notifyParent(message);
    }

    postLoaded(): void {
        const message: EmbeddedCheckoutLoadedEvent = {
            type: EmbeddedCheckoutEventType.CheckoutLoaded,
        };

        this._notifyParent(message);
    }

    private _notifyParent(message: EmbeddedCheckoutEvent): void {
        if (window === this._parentWindow) {
            return;
        }

        this._parentWindow.postMessage(message, this._parentOrigin);
    }
}
