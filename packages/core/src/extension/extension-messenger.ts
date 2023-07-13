import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import { ExtensionNotFoundError } from './errors';
import { Extension } from './extension';
import { ExtensionCommandHandlers } from './extension-command-handler';
import { ExtensionOriginEventMap, stringToExtensionCommand } from './extension-origin-event';
import { HostOriginEvent } from './host-origin-event';

export class ExtensionMessenger {
    private _extensions: Extension[] | undefined;
    private _listeners: { [extensionId: string]: IframeEventListener<ExtensionOriginEventMap> } =
        {};
    private _posters: { [extensionId: string]: IframeEventPoster<HostOriginEvent> } = {};

    listen(
        extensions: Extension[],
        extensionId: string,
        extensionCommandHandlers: ExtensionCommandHandlers,
    ): void {
        this._extensions = extensions;

        const extension = this._getExtensionById(extensionId);

        if (!this._listeners[extensionId]) {
            this._listeners[extensionId] = new IframeEventListener(extension.url);
        }

        const listener = this._listeners[extensionId];

        listener.listen();

        Object.entries(extensionCommandHandlers).forEach(([command, handler]) => {
            const extensionCommand = stringToExtensionCommand(command);

            if (extensionCommand && handler) {
                listener.addListener(extensionCommand, handler);
            }
        });
    }

    stopListen(extensionId: string, extensionCommandHandlers: ExtensionCommandHandlers): void {
        if (!this._listeners[extensionId]) {
            return;
        }

        const listener = this._listeners[extensionId];

        Object.entries(extensionCommandHandlers).forEach(([command, handler]) => {
            const extensionCommand = stringToExtensionCommand(command);

            if (extensionCommand && handler) {
                listener.removeListener(extensionCommand, handler);
            }
        });

        listener.stopListen();
    }

    post(extensionId: string, event: HostOriginEvent): void {
        const extension = this._getExtensionById(extensionId);

        const iframe = document
            .querySelector(`[data-extension-id="${extensionId}"]`)
            ?.querySelector('iframe');

        if (!iframe?.contentWindow) {
            throw new ExtensionNotFoundError(
                `Unable to post due to no extension rendered for ID: ${extensionId}.`,
            );
        }

        if (!this._posters[extensionId]) {
            this._posters[extensionId] = new IframeEventPoster(extension.url, iframe.contentWindow);
        }

        this._posters[extensionId].post(event);
    }

    private _getExtensionById(extensionId: string): Extension {
        if (!this._extensions) {
            throw new ExtensionNotFoundError(
                `Extension configurations not found or listen() not utilized prior.`,
            );
        }

        const extension = this._extensions.find((e) => e.id === extensionId);

        if (!extension) {
            throw new ExtensionNotFoundError(
                `Unable to post due to no extension found for ID: ${extensionId}.`,
            );
        }

        return extension;
    }
}
