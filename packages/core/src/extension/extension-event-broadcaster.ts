import { CheckoutSelectors } from '../checkout';
import { DataStoreProjection } from '../common/data-store';
import { IframeEventListener } from '../common/iframe';

import { ExtensionEvent, ExtensionEventType } from './extension-client';
import {
    ExtensionInternalCommandMap,
    ExtensionInternalCommandType,
    ExtensionSubscribeCommand,
    ExtensionUnsubscribeCommand,
} from './extension-internal-commands';
import { ExtensionMessenger } from './extension-messenger';
import { ExtensionChangeSubscriber, ExtensionChangeUnsubscriber } from './subscribers';

export class ExtensionEventBroadcaster {
    private _subscribed: { [id: string]: boolean } = {};
    private _unsubscribers: { [type: string]: ExtensionChangeUnsubscriber } = {};
    private _listeners: { [id: string]: IframeEventListener<ExtensionInternalCommandMap> } = {};

    constructor(
        private _store: DataStoreProjection<CheckoutSelectors>,
        private _extensionMessenger: ExtensionMessenger,
        private _subscribers: Record<ExtensionEventType, ExtensionChangeSubscriber>,
    ) {}

    listen(): void {
        const {
            data: { getExtensions },
        } = this._store.getState();

        getExtensions()?.forEach((extension) => {
            if (this._listeners[extension.id]) {
                return;
            }

            const eventListener = new IframeEventListener<ExtensionInternalCommandMap>(
                extension.url,
            );

            eventListener.addListener(
                ExtensionInternalCommandType.Subscribe,
                this._handleSubscribe.bind(this),
            );

            eventListener.addListener(
                ExtensionInternalCommandType.Unsubscribe,
                this._handleUnsubscribe.bind(this),
            );

            eventListener.listen();

            this._listeners[extension.id] = eventListener;
        });
    }

    broadcast(event: ExtensionEvent): void {
        const {
            data: { getExtensions },
        } = this._store.getState();

        getExtensions()?.forEach((extension) => {
            if (!this._subscribed[extension.id]) {
                return;
            }

            this._extensionMessenger.post(extension.id, event);
        });
    }

    private _handleSubscribe({
        payload: { eventType, extensionId },
    }: ExtensionSubscribeCommand): void {
        this._subscribed[extensionId] = true;

        if (this._unsubscribers[eventType]) {
            return;
        }

        this._unsubscribers[eventType] = this._subscribers[eventType](this._store, this);
    }

    private _handleUnsubscribe({
        payload: { eventType, extensionId },
    }: ExtensionUnsubscribeCommand): void {
        delete this._subscribed[extensionId];

        if (Object.keys(this._subscribed).length) {
            return;
        }

        this._unsubscribers[eventType]?.();

        delete this._unsubscribers[eventType];
    }
}
