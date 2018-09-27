import { IFrameComponent } from 'iframe-resizer';

import { EmbeddedCheckoutEventMap, EmbeddedCheckoutEventType } from './embedded-checkout-events';
import EmbeddedCheckoutListener from './embedded-checkout-listener';
import EmbeddedCheckoutOptions from './embedded-checkout-options';
import ResizableIframeCreator from './resizable-iframe-creator';

export default class EmbeddedCheckout {
    private _iframe?: IFrameComponent;
    private _isAttached: boolean;

    /**
     * @internal
     */
    constructor(
        private _iframeCreator: ResizableIframeCreator,
        private _messageListener: EmbeddedCheckoutListener,
        private _options: EmbeddedCheckoutOptions
    ) {
        this._isAttached = false;

        if (this._options.onComplete) {
            this.on(EmbeddedCheckoutEventType.CheckoutComplete, this._options.onComplete);
        }

        if (this._options.onError) {
            this.on(EmbeddedCheckoutEventType.CheckoutError, this._options.onError);
        }

        if (this._options.onLoad) {
            this.on(EmbeddedCheckoutEventType.CheckoutLoaded, this._options.onLoad);
        }

        if (this._options.onFrameLoad) {
            this.on(EmbeddedCheckoutEventType.FrameLoaded, this._options.onFrameLoad);
        }
    }

    attach(): Promise<this> {
        if (this._isAttached) {
            return Promise.resolve(this);
        }

        this._isAttached = true;
        this._messageListener.listen();

        return this._iframeCreator.createFrame(this._options.url, this._options.containerId)
            .then(iframe => {
                this._iframe = iframe;

                return this;
            })
            .catch(error => {
                this._isAttached = false;

                this._messageListener.trigger({
                    type: EmbeddedCheckoutEventType.CheckoutError,
                    payload: error,
                });

                throw error;
            });
    }

    detach(): void {
        if (!this._isAttached) {
            return;
        }

        this._isAttached = false;
        this._messageListener.stopListen();

        if (this._iframe && this._iframe.parentNode) {
            this._iframe.parentNode.removeChild(this._iframe);
            this._iframe.iFrameResizer.close();
        }
    }

    on<TType extends keyof EmbeddedCheckoutEventMap>(type: TType, listener: (event: EmbeddedCheckoutEventMap[TType]) => void): void {
        this._messageListener.addListener(type, listener);
    }

    off<TType extends keyof EmbeddedCheckoutEventMap>(type: TType, listener: (event: EmbeddedCheckoutEventMap[TType]) => void): void {
        this._messageListener.removeListener(type, listener);
    }
}
