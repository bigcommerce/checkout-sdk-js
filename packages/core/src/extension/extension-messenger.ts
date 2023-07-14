import { ReadableCheckoutStore } from '../checkout';
import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import { ExtensionNotFoundError } from './errors';
import { UnsupportedExtensionCommandError } from './errors/unsupported-extension-command-error';
import { Extension } from './extension';
import { ExtensionCommandHandler } from './extension-command-handler';
import { ExtensionCommand, ExtensionOriginEventMap } from './extension-origin-event';
import { HostOriginEvent } from './host-origin-event';

export class ExtensionMessenger {
    private _extensions: Extension[] | undefined;

    constructor(
        private _store: ReadableCheckoutStore,
        private _listeners: { [extensionId: string]: IframeEventListener<ExtensionOriginEventMap> },
        private _posters: { [extensionId: string]: IframeEventPoster<HostOriginEvent> },
    ) {}

    listen(
        extensionId: string,
        command: ExtensionCommand,
        extensionCommandHandler: ExtensionCommandHandler,
    ): () => void {
        const extension = this._getExtensionById(extensionId);

        if (!this._listeners[extensionId]) {
            this._listeners[extensionId] = new IframeEventListener(extension.url);
        }

        const listener = this._listeners[extensionId];

        listener.listen();

        const validCommand = this._validateCommand(command);

        listener.addListener(validCommand, extensionCommandHandler);

        return () => {
            listener.removeListener(validCommand, extensionCommandHandler);
        };
    }

    stopListen(extensionId: string): void {
        if (!this._listeners[extensionId]) {
            return;
        }

        const listener = this._listeners[extensionId];

        listener.stopListen();
    }

    post(extensionId: string, event: HostOriginEvent): void {
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

    private _validateCommand(command: string): ExtensionCommand {
        switch (command) {
            case 'RELOAD_CHECKOUT':
                return ExtensionCommand.ReloadCheckout;

            case 'SHOW_LOADING_INDICATOR':
                return ExtensionCommand.ShowLoadingIndicator;

            case 'SET_IFRAME_STYLE':
                return ExtensionCommand.SetIframeStyle;

            default:
                throw new UnsupportedExtensionCommandError();
        }
    }
}
