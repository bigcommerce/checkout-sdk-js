import { noop } from 'lodash';

import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import {
    ExtensionCommand,
    ExtensionCommandType,
    ExtensionEventMap,
    ExtensionEventType,
} from './extension-client';
import {
    ExtensionInternalCommand,
    ExtensionInternalCommandType,
} from './extension-internal-commands';

export default class ExtensionService {
    private _extensionId?: string;

    constructor(
        private _eventListener: IframeEventListener<ExtensionEventMap>,
        private _eventPoster: IframeEventPoster<ExtensionCommand>,
        private _internalEventPoster: IframeEventPoster<ExtensionInternalCommand>,
    ) {
        this._eventPoster.setTarget(window.parent);
        this._internalEventPoster.setTarget(window.parent);
    }

    initialize(extensionId: string): void {
        if (!extensionId) {
            throw new Error('Extension Id not found.');
        }

        this._extensionId = extensionId;

        this._eventListener.listen();
    }

    post(event: ExtensionCommand): void {
        if (!this._extensionId) {
            return;
        }

        if (!Object.values(ExtensionCommandType).includes(event.type)) {
            throw new Error(`${event.type} is not supported.`);
        }

        const payload = {
            ...event.payload,
            extensionId: this._extensionId,
        };

        this._eventPoster.post({ ...event, payload });
    }

    addListener(eventType: ExtensionEventType, callback: () => void = noop): () => void {
        if (!this._extensionId) {
            throw new Error('Extension is not initialized.');
        }

        const extensionId = this._extensionId;

        if (!Object.values(ExtensionEventType).includes(eventType)) {
            throw new Error(`${eventType} is not supported.`);
        }

        this._internalEventPoster.post({
            type: ExtensionInternalCommandType.Subscribe,
            payload: { extensionId, eventType },
        });

        this._eventListener.addListener(eventType, callback);

        return () => {
            this._internalEventPoster.post({
                type: ExtensionInternalCommandType.Unsubscribe,
                payload: { extensionId, eventType },
            });

            this._eventListener.removeListener(eventType, callback);
        };
    }
}
