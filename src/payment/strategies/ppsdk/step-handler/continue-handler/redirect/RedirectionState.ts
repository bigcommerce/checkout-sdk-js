import { parseUrl, Url } from '../../../../../../common/url';

export const PENDING_REDIRECT_PARAM = 'redirecting';
const paramRegex = new RegExp(`[&|\?]${PENDING_REDIRECT_PARAM}`);

export class RedirectionState {
    private _isRedirecting: boolean;

    constructor() {
        this._isRedirecting = this.currentUrlHasRedirectingParam();
    }

    isRedirecting() {
        return this._isRedirecting;
    }

    setRedirecting(value: boolean) {
        if (value) {
            this.setRedirectingParamOnUrl();
        } else {
            this.removeRedirectingParamFromUrl();
        }

        this._isRedirecting = value;
    }

    private currentUrlHasRedirectingParam(): boolean {
        return paramRegex.test(this.getCurrentUrl().search);
    }

    private getCurrentUrl(): Url {
        return parseUrl(window.location.href);
    }

    private replaceCurrentUrl(url: string) {
        window.history.replaceState(null, '', url);
    }

    private setRedirectingParamOnUrl() {
        if (this.currentUrlHasRedirectingParam()) {
            return;
        }

        const url = this.getCurrentUrl();
        const paramPrefix = url.search.length ? '&' : '?';
        const redirectingParam = `${paramPrefix}${PENDING_REDIRECT_PARAM}`;
        this.replaceCurrentUrl(`${url.href}${redirectingParam}`);
    }

    private removeRedirectingParamFromUrl() {
        if (!this.currentUrlHasRedirectingParam()) {
            return;
        }

        const url = this.getCurrentUrl();
        this.replaceCurrentUrl(url.href.replace(paramRegex, ''));
    }
}
