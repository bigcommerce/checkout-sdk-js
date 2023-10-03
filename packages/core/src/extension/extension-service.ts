import { noop } from 'lodash';

import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import {
    ExtensionCommand,
    ExtensionCommandContext,
    ExtensionCommandType,
} from './extension-commands';
import { ExtensionEventMap, ExtensionEventType } from './extension-events';
import {
    ExtensionInternalCommand,
    ExtensionInternalCommandType,
} from './extension-internal-commands';
import { ExtensionInternalEventType } from './extension-internal-events';

export default class ExtensionService {
    private _extensionId?: string;

    constructor(
        private _eventListener: IframeEventListener<ExtensionEventMap>,
        private _commandPoster: IframeEventPoster<ExtensionCommand, ExtensionCommandContext>,
        private _internalCommandPoster: IframeEventPoster<ExtensionInternalCommand>,
    ) {
        this._commandPoster.setTarget(window.parent);
        this._internalCommandPoster.setTarget(window.parent);
    }

    async initialize(extensionId: string): Promise<void> {
        if (!extensionId) {
            throw new Error('Extension Id not found.');
        }

        this._extensionId = extensionId;

        this._eventListener.listen();
        this._commandPoster.setContext({ extensionId });

        try {
            await this._internalCommandPoster.post(
                {
                    type: ExtensionInternalCommandType.ResizeIframe,
                    payload: { extensionId },
                },
                {
                    successType: ExtensionInternalEventType.ExtensionReady,
                    errorType: ExtensionInternalEventType.ExtensionFailed,
                },
            );
        } catch (event) {
            if (this._isExtensionFailedEvent(event)) {
                throw new Error(
                    'Extension failed to load within 60 seconds; please reload and try again.',
                );
            }
        }
    }

    post(command: ExtensionCommand): void {
        if (!Object.values(ExtensionCommandType).includes(command.type)) {
            throw new Error(`${command.type} is not supported.`);
        }

        this._commandPoster.post(command);
    }

    addListener(eventType: ExtensionEventType, callback: () => void = noop): () => void {
        if (!this._extensionId) {
            throw new Error('Extension is not initialized.');
        }

        const extensionId = this._extensionId;

        if (!Object.values(ExtensionEventType).includes(eventType)) {
            throw new Error(`${eventType} is not supported.`);
        }

        this._internalCommandPoster.post({
            type: ExtensionInternalCommandType.Subscribe,
            payload: { extensionId, eventType },
        });

        this._eventListener.addListener(eventType, callback);

        return () => {
            this._internalCommandPoster.post({
                type: ExtensionInternalCommandType.Unsubscribe,
                payload: { extensionId, eventType },
            });

            this._eventListener.removeListener(eventType, callback);
        };
    }

    private _isExtensionFailedEvent(
        event: any,
    ): event is ExtensionInternalEventType.ExtensionFailed {
        return event.type === ExtensionInternalEventType.ExtensionFailed;
    }
}
