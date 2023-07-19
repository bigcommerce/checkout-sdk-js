import { noop } from 'lodash';

import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import {
    ExtensionCommand,
    ExtensionCommandType,
    ExtensionEventMap,
    ExtensionEventType,
} from './extension-client';

export default class ExtensionService {
    private _extensionId?: string;

    constructor(
        private _eventListener: IframeEventListener<ExtensionEventMap>,
        private _eventPoster: IframeEventPoster<ExtensionCommand>,
    ) {
        this._eventPoster.setTarget(window.parent);
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
        if (!Object.values(ExtensionEventType).includes(eventType)) {
            throw new Error(`${eventType} is not supported.`);
        }

        this._eventListener.addListener(eventType, callback);

        return () => this._eventListener.removeListener(eventType, callback);
    }
}
