import { RequestSender } from '@bigcommerce/request-sender';
import { IFrameComponent } from 'iframe-resizer';

import { parseUrl } from '../common/url';

import { EmbeddedCheckoutEventMap, EmbeddedCheckoutEventType } from './embedded-checkout-events';
import EmbeddedCheckoutOptions from './embedded-checkout-options';
import { InvalidLoginTokenError } from './errors';
import { EmbeddedContentEvent, EmbeddedContentEventType } from './iframe-content/embedded-content-events';
import IframeEventListener from './iframe-event-listener';
import IframeEventPoster from './iframe-event-poster';
import LoadingIndicator from './loading-indicator';
import ResizableIframeCreator from './resizable-iframe-creator';

export default class EmbeddedCheckout {
    private _iframe?: IFrameComponent;
    private _isAttached: boolean;

    /**
     * @internal
     */
    constructor(
        private _iframeCreator: ResizableIframeCreator,
        private _messageListener: IframeEventListener<EmbeddedCheckoutEventMap>,
        private _messagePoster: IframeEventPoster<EmbeddedContentEvent>,
        private _loadingIndicator: LoadingIndicator,
        private _requestSender: RequestSender,
        private _options: EmbeddedCheckoutOptions
    ) {
        this._isAttached = false;

        if (this._options.onComplete) {
            this._messageListener.addListener(EmbeddedCheckoutEventType.CheckoutComplete, this._options.onComplete);
        }

        if (this._options.onError) {
            this._messageListener.addListener(EmbeddedCheckoutEventType.CheckoutError, this._options.onError);
        }

        if (this._options.onLoad) {
            this._messageListener.addListener(EmbeddedCheckoutEventType.CheckoutLoaded, this._options.onLoad);
        }

        if (this._options.onFrameLoad) {
            this._messageListener.addListener(EmbeddedCheckoutEventType.FrameLoaded, this._options.onFrameLoad);
        }

        if (this._options.onSignOut) {
            this._messageListener.addListener(EmbeddedCheckoutEventType.SignedOut, this._options.onSignOut);
        }

        this._messageListener.addListener(EmbeddedCheckoutEventType.FrameLoaded, () => this._configureStyles());
    }

    attach(): Promise<this> {
        if (this._isAttached) {
            return Promise.resolve(this);
        }

        this._isAttached = true;
        this._messageListener.listen();
        this._loadingIndicator.show(this._options.containerId);

        return this._attemptLogin()
            .then(url => this._iframeCreator.createFrame(url, this._options.containerId))
            .then(iframe => {
                this._iframe = iframe;

                this._configureStyles();
                this._loadingIndicator.hide();

                return this;
            })
            .catch(error => {
                this._isAttached = false;

                this._messageListener.trigger({
                    type: EmbeddedCheckoutEventType.FrameError,
                    payload: error,
                });

                this._loadingIndicator.hide();

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

    private _configureStyles(): void {
        if (!this._iframe || !this._iframe.contentWindow || !this._options.styles) {
            return;
        }

        this._messagePoster.setTarget(this._iframe.contentWindow);

        this._messagePoster.post({
            type: EmbeddedContentEventType.StyleConfigured,
            payload: this._options.styles,
        });
    }

    private _attemptLogin(): Promise<string> {
        if (!/^\/login\/token/.test(parseUrl(this._options.url).pathname)) {
            return Promise.resolve(this._options.url);
        }

        return this._requestSender.post(this._options.url)
            .then(({ body: { redirectUrl } }) => redirectUrl)
            .catch(response => Promise.reject(new InvalidLoginTokenError(response)));
    }
}
