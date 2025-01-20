import { ReadableCheckoutStore } from '../checkout';
import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import { createExtensionEventPoster } from './create-extension-event-poster';
import { ExtensionNotFoundError } from './errors';
import { UnsupportedExtensionCommandError } from './errors/unsupported-extension-command-error';
import { Extension } from './extension';
import {
    ExtensionCommandContext,
    ExtensionCommandMap,
    ExtensionCommandType,
} from './extension-commands';
import { ExtensionMessage } from './extension-message';

export class ExtensionMessenger {
    private _extensions: Extension[] | undefined;

    constructor(
        private _store: ReadableCheckoutStore,
        private _listeners: {
            [extensionId: string]: IframeEventListener<ExtensionCommandMap>;
        } = {},
        private _posters: { [extensionId: string]: IframeEventPoster<ExtensionMessage> } = {},
    ) {}

    clearCacheByRegion(region: string): void {
        const extension = this._getExtensionByRegion(region);

        this.clearCacheById(extension.id);
    }

    clearCacheById(extensionId: string): void {
        if (this._listeners[extensionId]) {
            delete this._listeners[extensionId];
        }

        if (this._posters[extensionId]) {
            delete this._posters[extensionId];
        }
    }

    listen<T extends keyof ExtensionCommandMap>(
        extensionId: string,
        command: T,
        commandHandler: (
            command: ExtensionCommandMap[T],
            context?: ExtensionCommandContext,
        ) => void,
    ): () => void {
        const extension = this._getExtensionById(extensionId);

        if (!this._listeners[extensionId]) {
            this._listeners[extensionId] = new IframeEventListener(extension.url);
        }

        const listener = this._listeners[extensionId];

        listener.listen();

        const validCommandType = this._validateCommand<T>(command);

        const commandHandlerProxy = (
            command: ExtensionCommandMap[T],
            context?: ExtensionCommandContext,
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

    stopListen(extensionId: string): void {
        if (!this._listeners[extensionId]) {
            return;
        }

        const listener = this._listeners[extensionId];

        listener.stopListen();
    }

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
}
