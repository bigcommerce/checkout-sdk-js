import ResizableIframeCreator from '../embedded-checkout/resizable-iframe-creator';

import { Extension } from './extension';

export class ExtensionIframe {
    private _iframe: HTMLIFrameElement | undefined;
    private _url: URL;

    constructor(
        private _containerId: string,
        private _extension: Extension,
        private _cartId: string,
    ) {
        this._url = new URL(this._extension.url);

        this._url.searchParams.set('extensionId', this._extension.id);
        this._url.searchParams.set('cartId', this._cartId);
    }

    async attach(): Promise<void> {
        const iframeCreator = new ResizableIframeCreator();

        this._iframe = await iframeCreator.createFrame(this._url.toString(), this._containerId);

        const container = document.getElementById(this._containerId);

        container?.setAttribute('data-extension-id', this._extension.id);
    }

    detach(): void {
        if (this._iframe && this._iframe.parentElement) {
            this._iframe.parentElement.removeChild(this._iframe);
        }
    }
}
