import { WorkerEventListener, WorkerEventPoster } from '../common/worker';

import {
    ExtensionNotFoundError,
    UnsupportedExtensionCommandError,
    UnsupportedExtensionQueryError,
} from './errors';
import { ExtensionCommandMap, ExtensionCommandType } from './extension-commands';
import { ExtensionCommandOrQueryContext, ExtensionMessage } from './extension-message';
import { ExtensionQueryMap, ExtensionQueryType } from './extension-queries';

export class WorkerExtensionMessenger {
    constructor(
        private _workers: { [extensionId: string]: Worker } = {},
        private _commandListeners: {
            [extensionId: string]: WorkerEventListener<ExtensionCommandMap>;
        } = {},
        private _queryListeners: {
            [extensionId: string]: WorkerEventListener<ExtensionQueryMap>;
        } = {},
    ) {}

    add(extensionId: string, worker: Worker): void {
        this._workers[extensionId] = worker;
    }

    listenForCommand<T extends keyof ExtensionCommandMap>(
        extensionId: string,
        command: T,
        commandHandler: (
            command: ExtensionCommandMap[T],
            context?: ExtensionCommandOrQueryContext,
        ) => Promise<void> | void,
    ): () => void {
        const worker = this._getWorkerById(extensionId);

        if (!this._commandListeners[extensionId]) {
            this._commandListeners[extensionId] = new WorkerEventListener(worker);
        }

        const listener = this._commandListeners[extensionId];

        listener.listen();

        const validCommandType = this._validateCommand<T>(command);

        const commandHandlerProxy = (
            command: ExtensionCommandMap[T],
            context?: ExtensionCommandOrQueryContext,
        ) => {
            if (context?.extensionId === extensionId) {
                commandHandler(command, context);
            }
        };

        listener.addListener(validCommandType, commandHandlerProxy);

        return () => {
            listener.removeListener(validCommandType, commandHandlerProxy);
        };
    }

    listenForQuery<T extends keyof ExtensionQueryMap>(
        extensionId: string,
        query: T,
        queryHandler: (
            query: ExtensionQueryMap[T],
            context?: ExtensionCommandOrQueryContext,
        ) => Promise<void> | void,
    ): () => void {
        const worker = this._getWorkerById(extensionId);

        if (!this._queryListeners[extensionId]) {
            this._queryListeners[extensionId] = new WorkerEventListener(worker);
        }

        const listener = this._queryListeners[extensionId];

        listener.listen();

        const validQueryType = this._validateQuery<T>(query);

        const queryHandlerProxy = (
            query: ExtensionQueryMap[T],
            context?: ExtensionCommandOrQueryContext,
        ) => {
            if (context?.extensionId === extensionId) {
                queryHandler(query, context);
            }
        };

        listener.addListener(validQueryType, queryHandlerProxy);

        return () => {
            listener.removeListener(validQueryType, queryHandlerProxy);
        };
    }

    stopListen(extensionId: string): void {
        if (this._commandListeners[extensionId]) {
            this._commandListeners[extensionId].stopListen();
        }

        if (this._queryListeners[extensionId]) {
            this._queryListeners[extensionId].stopListen();
        }
    }

    post(extensionId: string, message: ExtensionMessage): void {
        if (!this._workers[extensionId]) {
            throw new Error(`Worker with extensionId ${extensionId} not found`);
        }

        const workerPoster = new WorkerEventPoster(this._workers[extensionId], extensionId);

        workerPoster.post(message);
    }

    clearCacheById(extensionId: string): void {
        delete this._workers[extensionId];
    }

    private _getWorkerById(extensionId: string): Worker {
        const worker = this._workers[extensionId];

        if (!worker) {
            throw new ExtensionNotFoundError(`Worker with extensionId ${extensionId} not found`);
        }

        return worker;
    }

    private _validateCommand<T extends keyof ExtensionCommandMap>(command: T): T {
        if (Object.values(ExtensionCommandType).includes(command)) {
            return command;
        }

        throw new UnsupportedExtensionCommandError();
    }

    private _validateQuery<T extends keyof ExtensionQueryMap>(query: T): T {
        if (Object.values(ExtensionQueryType).includes(query)) {
            return query;
        }

        throw new UnsupportedExtensionQueryError();
    }
}
