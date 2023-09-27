import { IFrameComponent, iframeResizer, isIframeEvent } from '../common/iframe';
import { parseUrl } from '../common/url';

import { ExtensionNotLoadedError } from './errors';
import { ExtensionInternalCommandType } from './extension-internal-commands';
import { ExtensionInternalEventType } from './extension-internal-events';
import { ExtensionMessenger } from './extension-messenger';

export default class ResizableIframeCreator {
    constructor(
        private _extensionId: string,
        private _extensionMessenger: ExtensionMessenger,
        private _options?: { timeout: number },
    ) {}

    createFrame(src: string, containerId: string): Promise<IFrameComponent> {
        const container = document.getElementById(containerId);
        const { timeout = 60000 } = this._options || {};

        if (!container) {
            throw new ExtensionNotLoadedError(
                'Unable to embed the iframe because the container element could not be found.',
            );
        }

        const iframe = document.createElement('iframe');

        iframe.src = src;
        iframe.style.border = 'none';
        iframe.style.display = 'none';
        iframe.style.width = '100%';

        container.appendChild(iframe);

        return this._toResizableFrame(iframe, timeout).catch((error) => {
            container.removeChild(iframe);

            throw error;
        });
    }

    private _toResizableFrame(
        iframe: HTMLIFrameElement,
        timeoutInterval: number,
    ): Promise<IFrameComponent> {
        // Can't simply listen to `load` event because it always gets triggered even if there's an error.
        // Instead, listen to the `load` inside the iframe and let the parent frame know when it happens.
        return new Promise((resolve, reject) => {
            const timeout = window.setTimeout(() => {
                this._extensionMessenger.post(this._extensionId, {
                    type: ExtensionInternalEventType.ExtensionFailed,
                });

                reject(
                    new ExtensionNotLoadedError(
                        'Unable to load the extension because the content could not be loaded.',
                    ),
                );
            }, timeoutInterval);

            const handleMessage = (event: MessageEvent) => {
                if (event.origin !== parseUrl(iframe.src).origin) {
                    return;
                }

                if (isIframeEvent(event.data, ExtensionInternalCommandType.ResizeIframe)) {
                    iframe.style.display = '';

                    const iframes = iframeResizer(
                        {
                            autoResize: false,
                            scrolling: false,
                            sizeWidth: false,
                            heightCalculationMethod: 'bodyOffset',
                        },
                        iframe,
                    );

                    resolve(iframes[iframes.length - 1]);
                }

                if (
                    typeof event.data === 'string' &&
                    /\[iFrameSizer]iFrameResizer.*init/.test(event.data)
                ) {
                    this._extensionMessenger.post(this._extensionId, {
                        type: ExtensionInternalEventType.ExtensionReady,
                    });

                    teardown();
                }
            };

            const teardown = () => {
                window.removeEventListener('message', handleMessage);
                window.clearTimeout(timeout);
            };

            window.addEventListener('message', handleMessage);
        });
    }
}
