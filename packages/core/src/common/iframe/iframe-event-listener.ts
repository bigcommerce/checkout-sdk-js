import { bindDecorator as bind } from '@bigcommerce/checkout-sdk/utility';

import { appendWww, parseUrl } from '../url';

import { IframeEventMap } from './iframe-event';
import isIframeEvent from './is-iframe-event';

export default class IframeEventListener<
    TEventMap extends IframeEventMap<keyof TEventMap>,
    TContext = undefined,
> {
    private _isListening: boolean;
    private _listeners: EventListeners<TEventMap, TContext>;
    private _sourceOrigins: string[];

    constructor(sourceOrigin: string) {
        this._sourceOrigins = [
            parseUrl(sourceOrigin).origin,
            appendWww(parseUrl(sourceOrigin)).origin,
        ];
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

    addListener<TType extends keyof TEventMap>(
        type: TType,
        listener: (event: TEventMap[TType], context?: TContext) => void,
    ): void {
        let listeners = this._listeners[type];

        if (!listeners) {
            this._listeners[type] = listeners = [];
        }

        if (listeners.indexOf(listener) === -1) {
            listeners.push(listener);
        }
    }

    removeListener<TType extends keyof TEventMap>(
        type: TType,
        listener: (event: TEventMap[TType], context?: TContext) => void,
    ): void {
        const listeners = this._listeners[type];

        if (!listeners) {
            return;
        }

        const index = listeners.indexOf(listener);

        if (index >= 0) {
            listeners.splice(index, 1);
        }
    }

    trigger<TType extends keyof TEventMap>(event: TEventMap[TType], context?: TContext): void {
        const listeners = this._listeners[event.type];

        if (!listeners) {
            return;
        }

        listeners.forEach((listener) => (context ? listener(event, context) : listener(event)));
    }

    @bind
    private _handleMessage(messageEvent: MessageEvent): void {
        if (
            this._sourceOrigins.indexOf(messageEvent.origin) === -1 ||
            !isIframeEvent(messageEvent.data as TEventMap[keyof TEventMap], messageEvent.data.type)
        ) {
            return;
        }

        const { context, ...event } = messageEvent.data;

        this.trigger(event, context);
    }
}

type EventListeners<TEventMap, TContext = undefined> = {
    [key in keyof TEventMap]?: Array<(event: TEventMap[key], context?: TContext) => void>;
};
