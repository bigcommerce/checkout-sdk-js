import { ScriptLoader } from '@bigcommerce/script-loader';

export default class GoogleRecaptchaScriptLoader {
    private _loadPromise?: Promise<ReCaptchaV2.ReCaptcha>;

    constructor(
        private _scriptLoader: ScriptLoader,
        private _window: GoogleRecaptchaWindow = window
    ) {}

    load(): Promise<ReCaptchaV2.ReCaptcha> {
        if (!this._loadPromise) {
            this._loadPromise = this._loadScript();
        }

        return this._loadPromise;
    }

    private _loadScript(): Promise<ReCaptchaV2.ReCaptcha> {
        const callbackName = 'initRecaptcha';
        const params = [
            `onload=${callbackName}`,
            'render=explicit',
        ].join('&');

        return new Promise((resolve, reject) => {
            this._window[callbackName] = () => resolve(this._window.grecaptcha);

            this._scriptLoader.loadScript(`//www.google.com/recaptcha/api.js?${params}`)
                .catch(error => {
                    this._loadPromise = undefined;
                    reject(error);
                });
        });
    }
}

export interface GoogleRecaptchaWindow extends Window {
    grecaptcha?: ReCaptchaV2.ReCaptcha;
    initRecaptcha?(): void;
}
