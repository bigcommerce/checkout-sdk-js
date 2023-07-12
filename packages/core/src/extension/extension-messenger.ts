import { IframeEventPoster } from '../common/iframe';
import { appendWww, parseUrl } from '../common/url';
import { bindDecorator as bind } from '../common/utility';

import { ExtensionNotFoundError } from './errors';
import { Extension } from './extension';
import { ExtensionCommandHandlers } from './extension-command-handler';
import { ExtensionOriginEvent } from './extension-origin-event';
import { HostOriginEvent } from './host-origin-event';

export class ExtensionMessenger {
    private _isListening = false;
    private _extensions: Extension[] | undefined;
    private _extensionCommandHandlers: ExtensionCommandHandlers = {};
    private _posters: { [extensionId: string]: IframeEventPoster<HostOriginEvent> } = {};

    listen(extensions: Extension[], extensionCommandHandlers: ExtensionCommandHandlers): void {
        this._extensions = extensions;
        this._extensionCommandHandlers = extensionCommandHandlers;

        if (this._isListening) {
            return;
        }

        this._isListening = true;

        window.addEventListener('message', this._handleMessage);
    }

    post(extensionId: string, event: HostOriginEvent): void {
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

    @bind
    private _handleMessage(event: MessageEvent): void {
        const extensionId = event.data.payload?.extensionId;

        if (!extensionId || !this._extensions) {
            return;
        }

        const extension = this._extensions.find((e) => e.id === extensionId);

        if (!extension) {
            return;
        }

        const extensionOrigin = [
            parseUrl(extension.url).origin,
            appendWww(parseUrl(extension.url)).origin,
        ];

        if (extensionOrigin.indexOf(event.origin) === -1) {
            return;
        }

        this._trigger(event.data);
    }

    private _trigger(data: ExtensionOriginEvent): void {
        if (!this._extensionCommandHandlers) {
            return;
        }

        const handler = this._extensionCommandHandlers[data.type];

        if (!handler) {
            return;
        }

        handler(data);
    }
}
