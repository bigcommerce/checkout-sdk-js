import { noop } from 'lodash';

import { Consignment } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { ExtensionCommandType } from './extension-commands';
import { ExtensionEventMap, ExtensionEventType } from './extension-events';
// import {
//     ExtensionInternalCommand,
//     ExtensionInternalCommandType,
// } from './extension-internal-commands';
// import { ExtensionInternalEventType } from './extension-internal-events';
import {
    ExtensionCommandOrQuery,
    ExtensionCommandOrQueryContext,
    ExtensionMessageMap,
    ExtensionMessageType,
    GetConsignmentsMessage,
} from './extension-message';
import { ExtensionQueryType } from './extension-queries';
import { WorkerEventListener, WorkerEventPoster } from '../common/worker';

export default class WorkerExtensionService {
    // private _extensionId?: string;

    constructor(
        private _messageListener: WorkerEventListener<ExtensionMessageMap>,
        private _eventListener: WorkerEventListener<ExtensionEventMap>,
        private _messagePoster: WorkerEventPoster<
            ExtensionCommandOrQuery,
            ExtensionCommandOrQueryContext
        >,
        // private _internalCommandPoster: WorkerEventPoster<ExtensionInternalCommand>,
    ) { }

    async initialize(): Promise<void> {

        this._messageListener.listen();
        this._eventListener.listen();

        // try {
        //     await this._internalCommandPoster.post(
        //         // Add a command for handshake,
        //         {
        //             type: ExtensionInternalCommandType.WorkerHandshake,
        //             payload: { extensionId: 'tbd' },
        //         },
        //         {
        //             successType: ExtensionInternalEventType.ExtensionReady,
        //             errorType: ExtensionInternalEventType.ExtensionFailed,
        //         },
        //     );

        //     // this._internalCommandPoster.post({
        //     //     type: ExtensionInternalCommandType.Subscribe,
        //     //     payload: { extensionId: 'tbd', eventType },
        //     // });
        // } catch (event) {
        //     if (this._isExtensionFailedEvent(event)) {
        //         throw new Error(
        //             'Extension failed to load within 60 seconds; please reload and try again.',
        //         );
        //     }
        // }
    }

    post(command: ExtensionCommandOrQuery): void {
        if (!this._isCommandOrQueryType(command.type)) {
            throw new Error(`${command.type} is not supported.`);
        }

        this._messagePoster.post(command);
    }

    addListener(eventType: ExtensionEventType, callback: () => void = noop): () => void {
        if (!Object.values(ExtensionEventType).includes(eventType)) {
            throw new Error(`${eventType} is not supported.`);
        }

        this._eventListener.addListener(eventType, callback);

        return () => {
            this._eventListener.removeListener(eventType, callback);
        };
    }

    // terminate(eventType: ExtensionEventType): void {
    //     this._internalCommandPoster.post({
    //         type: ExtensionInternalCommandType.Unsubscribe,
    //         payload: { extensionId: 'tbd', eventType },
    //     });
    // }

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

    // private _isExtensionFailedEvent(
    //     event: any,
    // ): event is ExtensionInternalEventType.ExtensionFailed {
    //     return event.type === ExtensionInternalEventType.ExtensionFailed;
    // }

    private _isCommandOrQueryType(type: any): type is ExtensionCommandOrQuery['type'] {
        return (
            Object.values(ExtensionCommandType).includes(type) ||
            Object.values(ExtensionQueryType).includes(type)
        );
    }
}
