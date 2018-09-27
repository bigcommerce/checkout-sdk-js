import { bindDecorator as bind } from '../common/utility';

import { EmbeddedCheckoutEvent, EmbeddedCheckoutEventMap } from './embedded-checkout-events';
import isEmbeddedCheckoutEvent from './is-embedded-checkout-event';

export default class EmbeddedCheckoutListener {
    private _isListening: boolean;
    private _listeners: {
        [key: string]: Array<(event: EmbeddedCheckoutEventMap[keyof EmbeddedCheckoutEventMap]) => void>;
    };

    constructor(
        private _origin: string
    ) {
        this._isListening = false;
        this._listeners = {};
    }

    listen(): void {
        if (this._isListening) {
            return;
        }

        this._isListening = true;

        window.addEventListener('message', this._handleMessage);
    }

    stopListen(): void {
        if (!this._isListening) {
            return;
        }

        this._isListening = false;

        window.removeEventListener('message', this._handleMessage);
    }

    addListener<TType extends keyof EmbeddedCheckoutEventMap>(type: TType, listener: (event: EmbeddedCheckoutEventMap[TType]) => void): void {
        if (!this._listeners[type]) {
            this._listeners[type] = [];
        }

        this._listeners[type].push(listener);
    }

    removeListener<TType extends keyof EmbeddedCheckoutEventMap>(type: TType, listener: (event: EmbeddedCheckoutEventMap[TType]) => void): void {
        const index = this._listeners[type] && this._listeners[type].indexOf(listener);

        if (index >= 0) {
            this._listeners[type].splice(index, 1);
        }
    }

    trigger(event: EmbeddedCheckoutEvent): void {
        const listeners = this._listeners[event.type];

        if (!listeners) {
            return;
        }

        listeners.forEach(listener => {
            listener(event);
        });
    }

    @bind
    private _handleMessage(event: MessageEvent): void {
        if ((event.origin !== this._origin) || !isEmbeddedCheckoutEvent(event.data)) {
            return;
        }

        this.trigger(event.data);
    }
}
