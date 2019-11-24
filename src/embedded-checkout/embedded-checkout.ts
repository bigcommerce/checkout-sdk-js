import { RequestSender } from '@bigcommerce/request-sender';

import { IframeEventListener, IframeEventPoster, IFrameComponent } from '../common/iframe';
import { BrowserStorage } from '../common/storage';
import { parseUrl } from '../common/url';
import { bindDecorator as bind } from '../common/utility';

import EmbeddedCheckoutError from './embedded-checkout-error';
import { EmbeddedCheckoutEventMap, EmbeddedCheckoutEventType } from './embedded-checkout-events';
import EmbeddedCheckoutOptions from './embedded-checkout-options';
import { InvalidLoginTokenError, NotEmbeddableError, NotEmbeddableErrorType } from './errors';
import { EmbeddedContentEvent, EmbeddedContentEventType } from './iframe-content';
import LoadingIndicator from './loading-indicator';
import ResizableIframeCreator from './resizable-iframe-creator';

export const ALLOW_COOKIE_ATTEMPT_INTERVAL = 10 * 60 * 1000;
export const IS_COOKIE_ALLOWED_KEY = 'isCookieAllowed';
export const LAST_ALLOW_COOKIE_ATTEMPT_KEY = 'lastAllowCookieAttempt';

@bind
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
        private _storage: BrowserStorage,
        private _location: Location,
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

        return this._allowCookie()
            .then(() => this._attemptLogin())
            .then(url => this._iframeCreator.createFrame(url, this._options.containerId))
            .then(iframe => {
                this._iframe = iframe;

                this._configureStyles();
                this._loadingIndicator.hide();
            })
            .catch(error => {
                this._isAttached = false;

                return this._retryAllowCookie(error)
                    .catch(() => {
                        this._messageListener.trigger({
                            type: EmbeddedCheckoutEventType.FrameError,
                            payload: error,
                        });

                        this._loadingIndicator.hide();

                        throw error;
                    });
            })
            .then(() => this);
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

    /**
     * This workaround is required for certain browsers (namely Safari) that
     * prevent session cookies to be set for a third party website unless the
     * user has recently visited such website. Therefore, before we attempt to
     * login or set an active cart in the session, we need to first redirect the
     * user to the domain of Embedded Checkout.
     */
    private _allowCookie(): Promise<void> {
        if (this._storage.getItem(IS_COOKIE_ALLOWED_KEY)) {
            return Promise.resolve();
        }

        this._storage.setItem(IS_COOKIE_ALLOWED_KEY, true);

        // It could be possible that the flag is set to true but the browser has
        // already removed the permission to store third-party cookies. In that
        // case, we should try to redirect the user again. But we only want to
        // do it once within a fixed interval. This is to avoid getting into a
        // redirect loop if the shopper actually doesn't have a valid card
        // session.
        this._storage.setItem(LAST_ALLOW_COOKIE_ATTEMPT_KEY, Date.now());

        const { origin } = parseUrl(this._options.url);
        const redirectUrl = `${origin}/embedded-checkout/allow-cookie?returnUrl=${encodeURIComponent(this._location.href)}`;

        document.body.style.visibility = 'hidden';
        this._location.replace(redirectUrl);

        return new Promise<never>(() => {});
    }

    private _retryAllowCookie(error: EmbeddedCheckoutError): Promise<void> {
        const lastAttempt = Number(this._storage.getItem(LAST_ALLOW_COOKIE_ATTEMPT_KEY));
        const canRetry = (
            (!lastAttempt || Date.now() - lastAttempt > ALLOW_COOKIE_ATTEMPT_INTERVAL) &&
            error instanceof NotEmbeddableError &&
            error.subtype === NotEmbeddableErrorType.MissingContent
        );

        if (!canRetry) {
            return Promise.reject();
        }

        this._storage.removeItem(LAST_ALLOW_COOKIE_ATTEMPT_KEY);
        this._storage.removeItem(IS_COOKIE_ALLOWED_KEY);

        return this._allowCookie();
    }
}
