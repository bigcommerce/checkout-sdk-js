import { Extension, ExtensionIframeConfig } from './extension';
import { ExtensionMessenger } from './extension-messenger';
import ResizableIframeCreator from './resizable-iframe-creator';

export class ExtensionIframe {
    private _iframe: HTMLIFrameElement | undefined;
    private _url: URL;

    constructor(
        private _extensionMessenger: ExtensionMessenger,
        private _containerId: string,
        private _extension: Extension,
        private _config: ExtensionIframeConfig,
    ) {
        const { cartId, parentOrigin } = this._config;

        this._url = new URL(this._extension.url);

        this._url.searchParams.set('extensionId', this._extension.id);
        this._url.searchParams.set('cartId', cartId);
        this._url.searchParams.set('parentOrigin', parentOrigin);
    }

    async attach(): Promise<void> {
        if (
            document
                .querySelector(`[data-extension-id="${this._extension.id}"]`)
                ?.querySelector('iframe')
        ) {
            return;
        }

        const iframeCreator = new ResizableIframeCreator(
            this._extension.id,
            this._extensionMessenger,
        );

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
