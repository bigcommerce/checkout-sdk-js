import { ReadableCheckoutStore } from '../checkout';
import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import { ExtensionNotFoundError } from './errors';
import { UnsupportedExtensionCommandError } from './errors/unsupported-extension-command-error';
import { Extension } from './extension';
import { ExtensionEvent } from './extension-client';
import { ExtensionCommandMap, ExtensionCommandType } from './extension-command';

export class ExtensionMessenger {
    private _extensions: Extension[] | undefined;

    constructor(
        private _store: ReadableCheckoutStore,
        private _listeners: {
            [extensionId: string]: IframeEventListener<ExtensionCommandMap>;
        } = {},
        private _posters: { [extensionId: string]: IframeEventPoster<ExtensionEvent> } = {},
    ) {}

    listen<T extends keyof ExtensionCommandMap>(
        extensionId: string,
        command: T,
        extensionCommandHandler: (command: ExtensionCommandMap[T]) => void,
    ): () => void {
        const extension = this._getExtensionById(extensionId);

        if (!this._listeners[extensionId]) {
            this._listeners[extensionId] = new IframeEventListener(extension.url);
        }

        const listener = this._listeners[extensionId];

        listener.listen();

        const validCommandType = this._validateCommand<T>(command);

        listener.addListener(validCommandType, extensionCommandHandler);

        return () => {
            listener.removeListener(validCommandType, extensionCommandHandler);
        };
    }

    stopListen(extensionId: string): void {
        if (!this._listeners[extensionId]) {
            return;
        }

        const listener = this._listeners[extensionId];

        listener.stopListen();
    }

    post(extensionId: string, event: ExtensionEvent): void {
        if (!this._posters[extensionId]) {
            const extension = this._getExtensionById(extensionId);

            const iframe = document
                .querySelector(`[data-extension-id="${extensionId}"]`)
                ?.querySelector('iframe');

            if (!iframe?.contentWindow) {
                throw new ExtensionNotFoundError(
                    `Unable to post due to no extension rendered for ID: ${extensionId}.`,
                );
            }

            this._posters[extensionId] = new IframeEventPoster(extension.url, iframe.contentWindow);
        }

        this._posters[extensionId].post(event);
    }

    private _getExtensionById(extensionId: string): Extension {
        const {
            extensions: { getExtensions },
        } = this._store.getState();

        this._extensions = getExtensions();

        if (!this._extensions) {
            throw new ExtensionNotFoundError(`Extension configurations not found.`);
        }

        const extension = this._extensions.find((e) => e.id === extensionId);

        if (!extension) {
            throw new ExtensionNotFoundError(
                `Unable to proceed due to no extension found for ID: ${extensionId}.`,
            );
        }

        return extension;
    }

    private _validateCommand<T extends keyof ExtensionCommandMap>(command: string): T {
        if (this._isExtensionCommandType<T>(command)) {
            return command;
        }

        throw new UnsupportedExtensionCommandError();
    }

    private _isExtensionCommandType<T extends keyof ExtensionCommandMap>(
        command: string,
    ): command is T {
        return (
            command === ExtensionCommandType.FrameLoaded ||
            command === ExtensionCommandType.ReloadCheckout ||
            command === ExtensionCommandType.ShowLoadingIndicator ||
            command === ExtensionCommandType.SetIframeStyle
        );
    }
}
