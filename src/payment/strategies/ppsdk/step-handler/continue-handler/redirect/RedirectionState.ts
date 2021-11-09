export const PENDING_REDIRECT_PARAM = 'redirecting';

export class RedirectionState {
    private _isRedirecting: boolean;

    constructor() {
        this._isRedirecting = this.getCurrentUrl().searchParams.has(PENDING_REDIRECT_PARAM);
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

    private getCurrentUrl(): URL {
        return new URL(window.location.href);
    }

    private replaceCurrentUrl(url: URL) {
        window.history.replaceState(null, '', url.href);
    }

    private setRedirectingParamOnUrl() {
        const url = this.getCurrentUrl();
        url.searchParams.set(PENDING_REDIRECT_PARAM, 'true');
        this.replaceCurrentUrl(url);
    }

    private removeRedirectingParamFromUrl() {
        const url = this.getCurrentUrl();
        url.searchParams.delete(PENDING_REDIRECT_PARAM);
        this.replaceCurrentUrl(url);
    }
}
