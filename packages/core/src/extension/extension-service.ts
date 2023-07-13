import { noop } from 'lodash';

import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import {
    ExtensionListenEventMap,
    ExtensionListenEventType,
    ExtensionPostEvent,
} from './extension-client';

export default class ExtensionService {
    private _extensionId?: string;

    constructor(
        private _eventListener: IframeEventListener<ExtensionListenEventMap>,
        private _eventPoster: IframeEventPoster<ExtensionPostEvent>,
    ) {}

    initialize(extensionId: string) {
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
