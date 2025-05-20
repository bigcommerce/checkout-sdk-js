import { bindDecorator as bind } from '@bigcommerce/checkout-sdk/utility';

import { IframeEventMap } from '../iframe/iframe-event';

export class WorkerEventListener<
    TEventMap extends IframeEventMap<keyof TEventMap>,
    TContext = undefined,
> {
    private _isListening: boolean;
    private _listeners: EventListeners<TEventMap, TContext>;

    constructor(private _worker: Worker) {
        this._isListening = false;
        this._listeners = {};
    }

    listen(): void {
        if (this._isListening) {
            return;
        }

        this._isListening = true;

        this._worker.addEventListener('message', this._handleMessage);
    }

    stopListen(): void {
        if (!this._isListening) {
            return;
        }

        this._isListening = false;

        this._worker.removeEventListener('message', this._handleMessage);
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
        const { context, ...event } = messageEvent.data;

        this.trigger(event, context);
    }
}

type EventListeners<TEventMap, TContext = undefined> = {
    [key in keyof TEventMap]?: Array<(event: TEventMap[key], context?: TContext) => void>;
};
