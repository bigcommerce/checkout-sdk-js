import { InvalidExtensionConfigError } from './errors';
import { Extension } from './extension';

export class ExtensionIframe {
    private _iframe: HTMLIFrameElement;

    constructor(
        private _containerId: string,
        private _extension: Extension,
        private _cartId: string,
    ) {
        const url = new URL(this._extension.url);

        url.searchParams.set('extensionId', this._extension.id);
        url.searchParams.set('cartId', this._cartId);

        this._iframe = document.createElement('iframe');
        this._iframe.src = url.toString();
        this._iframe.style.border = 'none';
        this._iframe.style.height = '100%';
        this._iframe.style.overflow = 'hidden';
        this._iframe.style.width = '100%';
    }

    attach(): void {
        const container = document.getElementById(this._containerId);

        if (!container) {
            throw new InvalidExtensionConfigError(
                'Unable to proceed because the provided container ID is invalid.',
            );
        }

        container.appendChild(this._iframe);
    }

    detach(): void {
        if (!this._iframe.parentElement) {
            return;
        }

        this._iframe.parentElement.removeChild(this._iframe);
    }
}
