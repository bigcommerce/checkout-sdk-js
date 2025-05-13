import { noop } from 'lodash';

import { Consignment } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import { ExtensionCommandType } from './extension-commands';
import { ExtensionEventMap, ExtensionEventType } from './extension-events';
import {
    ExtensionInternalCommand,
    ExtensionInternalCommandType,
} from './extension-internal-commands';
import { ExtensionInternalEventType } from './extension-internal-events';
import {
    ExtensionCommandOrQuery,
    ExtensionCommandOrQueryContext,
    ExtensionMessageMap,
    ExtensionMessageType,
    GetConsignmentsMessage,
} from './extension-message';
import { ExtensionQueryType } from './extension-queries';

// TO BE DISCUSSED: Shall we create a new ExtensionService for worker?
export default class ExtensionService {
    private _extensionId?: string;

    constructor(
        private _messageListener: IframeEventListener<ExtensionMessageMap>,
        private _eventListener: IframeEventListener<ExtensionEventMap>,
        private _messagePoster: IframeEventPoster<
            ExtensionCommandOrQuery,
            ExtensionCommandOrQueryContext
        >,
        private _internalCommandPoster: IframeEventPoster<ExtensionInternalCommand>,
    ) {
        this._messagePoster.setTarget(window.parent);
        this._internalCommandPoster.setTarget(window.parent);
    }

    async initialize(extensionId: string): Promise<void> {
        if (!extensionId) {
            throw new Error('Extension Id not found.');
        }

        this._extensionId = extensionId;

        this._messageListener.listen();
        this._eventListener.listen();
        this._messagePoster.setContext({ extensionId });

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

    post(command: ExtensionCommandOrQuery): void {
        if (!this._isCommandOrQueryType(command.type)) {
            throw new Error(`${command.type} is not supported.`);
        }

        this._messagePoster.post(command);
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

    async getConsignments(useCache = true): Promise<Consignment[]> {
        return new Promise((resolve) => {
            const callback = (event: GetConsignmentsMessage) => {
                this._messageListener.removeListener(
                    ExtensionMessageType.GetConsignments,
                    callback,
                );

                resolve(event.payload.consignments);
            };

            this._messageListener.addListener(ExtensionMessageType.GetConsignments, callback);

            this.post({ type: ExtensionQueryType.GetConsignments, payload: { useCache } });
        });
    }

    private _isExtensionFailedEvent(
        event: any,
    ): event is ExtensionInternalEventType.ExtensionFailed {
        return event.type === ExtensionInternalEventType.ExtensionFailed;
    }

    private _isCommandOrQueryType(type: any): type is ExtensionCommandOrQuery['type'] {
        return (
            Object.values(ExtensionCommandType).includes(type) ||
            Object.values(ExtensionQueryType).includes(type)
        );
    }
}
