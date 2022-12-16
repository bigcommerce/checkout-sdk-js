import { exclude, ParsedUrl, parseUrl, stringifyUrl } from 'query-string';

export const PENDING_REDIRECT_PARAM = 'redirecting';

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
        return PENDING_REDIRECT_PARAM in this.getCurrentUrl().query;
    }

    private getCurrentUrl(): ParsedUrl {
        return parseUrl(window.location.href);
    }

    private replaceCurrentUrl(url: string) {
        window.history.replaceState(null, '', url);
    }

    private setRedirectingParamOnUrl() {
        if (this.currentUrlHasRedirectingParam()) {
            return;
        }

        const currentUrl = this.getCurrentUrl();
        const updatedUrl = {
            ...currentUrl,
            query: {
                ...currentUrl.query,
                [PENDING_REDIRECT_PARAM]: 'true',
            },
        };

        this.replaceCurrentUrl(stringifyUrl(updatedUrl));
    }

    private removeRedirectingParamFromUrl() {
        if (!this.currentUrlHasRedirectingParam()) {
            return;
        }

        this.replaceCurrentUrl(exclude(window.location.href, [PENDING_REDIRECT_PARAM]));
    }
}
