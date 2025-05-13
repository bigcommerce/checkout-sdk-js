import { ReadableCheckoutStore } from '../checkout';
import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import { createExtensionEventPoster } from './create-extension-event-poster';
import {
    ExtensionNotFoundError,
    UnsupportedExtensionCommandError,
    UnsupportedExtensionQueryError,
} from './errors';
import { Extension } from './extension';
import { ExtensionCommandMap, ExtensionCommandType } from './extension-commands';
import { ExtensionCommandOrQueryContext, ExtensionMessage } from './extension-message';
import { ExtensionQueryMap, ExtensionQueryType } from './extension-queries';

export class ExtensionMessenger {
    private _extensions: Extension[] | undefined;

    constructor(
        private _store: ReadableCheckoutStore,
        private _commandListeners: {
            [extensionId: string]: IframeEventListener<ExtensionCommandMap>;
        } = {},
        private _queryListeners: {
            [extensionId: string]: IframeEventListener<ExtensionQueryMap>;
        } = {},
        private _posters: { [extensionId: string]: IframeEventPoster<ExtensionMessage> } = {},
    ) {}

    clearCacheByRegion(region: string): void {
        const extension = this._getExtensionByRegion(region);

        this.clearCacheById(extension.id);
    }

    clearCacheById(extensionId: string): void {
        if (this._commandListeners[extensionId]) {
            delete this._commandListeners[extensionId];
        }

        if (this._queryListeners[extensionId]) {
            delete this._queryListeners[extensionId];
        }

        if (this._posters[extensionId]) {
            delete this._posters[extensionId];
        }
    }

    // TODO: Add support for handling worker commands
    listenForCommand<T extends keyof ExtensionCommandMap>(
        extensionId: string,
        command: T,
        commandHandler: (
            command: ExtensionCommandMap[T],
            context?: ExtensionCommandOrQueryContext,
        ) => Promise<void> | void,
    ): () => void {
        const extension = this._getExtensionById(extensionId);

        if (!this._commandListeners[extensionId]) {
            this._commandListeners[extensionId] = new IframeEventListener(extension.url);
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

    // TODO: Add support for handling worker queries
    listenForQuery<T extends keyof ExtensionQueryMap>(
        extensionId: string,
        query: T,
        queryHandler: (
            query: ExtensionQueryMap[T],
            context?: ExtensionCommandOrQueryContext,
        ) => Promise<void> | void,
    ): () => void {
        const extension = this._getExtensionById(extensionId);

        if (!this._queryListeners[extensionId]) {
            this._queryListeners[extensionId] = new IframeEventListener(extension.url);
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

    // TODO: Add support for posting to worker
    post(extensionId: string, message: ExtensionMessage): void {
        try {
            if (!this._posters[extensionId]) {
                const extension = this._getExtensionById(extensionId);

                this._posters[extensionId] =
                    createExtensionEventPoster<ExtensionMessage>(extension);
            }

            this._posters[extensionId].post(message);
        } catch (error) {
            this.clearCacheById(extensionId);
            // eslint-disable-next-line no-console
            console.log(
                `Unable to post event to extension(${extensionId}) because extension iframe is not mounted.\nThe event that could not be delivered:`,
                message,
            );
        }
    }

    private _getExtensionById(extensionId: string): Extension {
        this._getExtensions();

        const extension = this._extensions?.find((e) => e.id === extensionId);

        if (!extension) {
            throw new ExtensionNotFoundError(
                `Unable to proceed due to no extension found for ID: ${extensionId}.`,
            );
        }

        return extension;
    }

    private _getExtensionByRegion(region: string): Extension {
        this._getExtensions();

        const extension = this._extensions?.find((e) => e.region === region);

        if (!extension) {
            throw new ExtensionNotFoundError(
                `Unable to proceed due to no extension found for region: ${region}.`,
            );
        }

        return extension;
    }

    private _getExtensions(): void {
        if (this._extensions) {
            return;
        }

        const {
            extensions: { getExtensions },
        } = this._store.getState();

        this._extensions = getExtensions();

        if (!this._extensions) {
            throw new ExtensionNotFoundError(`Extension configurations not found.`);
        }
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
