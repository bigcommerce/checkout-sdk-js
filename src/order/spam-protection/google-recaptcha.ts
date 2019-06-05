import GoogleRecaptchaScriptLoader from './google-recaptcha-script-loader';

export default class GoogleRecaptcha {
    constructor(
        private googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader
    ) {}

    render(containerId: string, sitekey: string, callbacks: GoogleRecaptchaCallbacks): Promise<void> {
        return this.googleRecaptchaScriptLoader.load()
            .then(recaptcha => {
                recaptcha.render(containerId, {
                    sitekey,
                    ...callbacks,
                });
            });
    }
}

interface GoogleRecaptchaCallbacks {
    callback(token: string): void;
    'error-callback'?(): void;
    'expired-callback'?(): void;
}
