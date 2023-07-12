// imports types

import { noop } from 'lodash';

import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import {
    ExtensionListenEventMap,
    ExtensionListenEventType,
    ExtensionPostEvent,
} from './create-extension-service';

export default class ExtensionService {
    private _extensionId?: number;

    constructor(
        private _eventListener: IframeEventListener<ExtensionListenEventMap>,
        private _eventPoster: IframeEventPoster<ExtensionPostEvent>,
    ) {}

    initialize(extensionId: number) {
        if (!extensionId) {
            throw new Error('Extension Id not found.');
        }

        this._extensionId = extensionId;

        this._eventListener.listen();
    }

    post(event: ExtensionPostEvent): void {
        if (!this._extensionId) {
            return;
        }

        this._eventPoster.setTarget(window.parent);

        const payload = {
            ...event.payload,
            extensionId: this._extensionId,
        };

        this._eventPoster.post({ ...event, payload });
    }

    addListener(eventType: ExtensionListenEventType, callback: () => void = noop): void {
        this._eventListener.addListener(eventType, callback);
    }
}
