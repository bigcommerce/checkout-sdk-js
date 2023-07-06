import { IframeEventPoster } from '../common/iframe';
import { appendWww, parseUrl } from '../common/url';
import { bindDecorator as bind } from '../common/utility';

import { ExtensionNotFoundError } from './errors';
import { Extension } from './extension';
import { ExtensionCommandHandlers } from './extension-command-handler';
import { ExtensionPostEvent } from './extension-post-event';

export class ExtensionMessenger {
    _isListening = false;
    _extensionCommandHandlers: ExtensionCommandHandlers | undefined;

    constructor(
        private _poster: IframeEventPoster<ExtensionPostEvent>,
        private _extensions: Extension[] | undefined,
    ) {}

    listen(extensionCommandHandlers: ExtensionCommandHandlers): void {
        this._extensionCommandHandlers = extensionCommandHandlers;

        if (this._isListening) {
            return;
        }

        this._isListening = true;

        window.addEventListener('message', this._handleMessage);
    }

    post(event: ExtensionPostEvent, extensionId?: string): void {
        if (extensionId && this._extensions) {
            // Post to extension
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

            this._poster.setTarget(iframe.contentWindow);
            this._poster.setTargetOrigin(extension.url);
        } else {
            // Post to host
            this._poster.setTarget(window.parent);
            this._poster.setTargetOrigin(window.document.referrer);
        }

        this._poster.post(event);
    }

    @bind
    private _handleMessage(event: MessageEvent): void {
        if (this._extensions) {
            // Validate event as an extension-originated event.
            const extensionId = event.data.payload?.extensionId;

            if (!extensionId) {
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
        } else if (event.origin !== window.parent.origin) {
            // Validate event as an host-originated event.
            return;
        }

        this._trigger(event.data);
    }

    private _trigger(data: ExtensionPostEvent): void {
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
