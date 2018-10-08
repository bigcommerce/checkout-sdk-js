import { iframeResizer, IFrameComponent } from 'iframe-resizer';

import { EmbeddedCheckoutEventType } from './embedded-checkout-events';
import { NotEmbeddableError } from './errors';
import isIframeEvent from './is-iframe-event';
import parseOrigin from './parse-origin';

export default class ResizableIframeCreator {
    constructor(
        private _options?: { timeout: number }
    ) {}

    createFrame(src: string, containerId: string): Promise<IFrameComponent> {
        const container = document.getElementById(containerId);
        const { timeout = 60000 } = this._options || {};

        if (!container) {
            throw new NotEmbeddableError('Unable to embed the iframe because the container element could not be found.');
        }

        const iframe = document.createElement('iframe');

        iframe.src = src;
        iframe.style.border = 'none';
        iframe.style.display = 'none';
        iframe.style.width = '100%';

        container.appendChild(iframe);

        return this._toResizableFrame(iframe, timeout)
            .catch(error => {
                container.removeChild(iframe);

                throw error;
            });
    }

    private _toResizableFrame(iframe: HTMLIFrameElement, timeoutInterval: number): Promise<IFrameComponent> {
        // Can't simply listen to `load` event because it always gets triggered even if there's an error.
        // Instead, listen to the `load` inside the iframe and let the parent frame know when it happens.
        return new Promise((resolve, reject) => {
            const timeout = window.setTimeout(() => {
                reject(new NotEmbeddableError('Unable to embed the iframe because the content could not be loaded.'));
            }, timeoutInterval);

            const handleMessage = (event: MessageEvent) => {
                if (event.origin !== parseOrigin(iframe.src)) {
                    return;
                }

                if (isIframeEvent(event.data, EmbeddedCheckoutEventType.FrameError)) {
                    teardown();
                    reject(new NotEmbeddableError(event.data.payload.message));
                }

                if (isIframeEvent(event.data, EmbeddedCheckoutEventType.FrameLoaded)) {
                    iframe.style.display = '';

                    const iframes = iframeResizer({
                        scrolling: false,
                        sizeWidth: false,
                        heightCalculationMethod: 'lowestElement',
                    }, iframe);

                    teardown();
                    resolve(iframes[iframes.length - 1]);
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
