import { parseUrl } from '../url';
import { bindDecorator as bind } from '../utility';

import { IframeEventMap } from './iframe-event';
import isIframeEvent from './is-iframe-event';

export default class IframeEventListener<TEventMap extends IframeEventMap<keyof TEventMap>> {
    private _isListening: boolean;
    private _listeners: EventListeners<TEventMap>;
    private _sourceOrigin: string;

    constructor(
        sourceOrigin: string
    ) {
        this._sourceOrigin = parseUrl(sourceOrigin).origin;
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

    addListener<TType extends keyof TEventMap>(type: TType, listener: (event: TEventMap[TType]) => void): void {
        let listeners = this._listeners[type];

        if (!listeners) {
            this._listeners[type] = listeners = [];
        }

        if (listeners.indexOf(listener) === -1) {
            listeners.push(listener);
        }
    }

    removeListener<TType extends keyof TEventMap>(type: TType, listener: (event: TEventMap[TType]) => void): void {
        const listeners = this._listeners[type];

        if (!listeners) {
            return;
        }

        const index = listeners.indexOf(listener);

        if (index >= 0) {
            listeners.splice(index, 1);
        }
    }

    trigger<TType extends keyof TEventMap>(event: TEventMap[TType]): void {
        const listeners = this._listeners[event.type];

        if (!listeners) {
            return;
        }

        listeners.forEach(listener => listener(event));
    }

    @bind
    private _handleMessage(event: MessageEvent): void {
        if ((event.origin !== this._sourceOrigin) ||
            !isIframeEvent(event.data as TEventMap[keyof TEventMap], event.data.type)
        ) {
            return;
        }

        this.trigger(event.data);
    }
}

type EventListeners<TEventMap> = {
    [key in keyof TEventMap]?: Array<(event: TEventMap[key]) => void>;
};
