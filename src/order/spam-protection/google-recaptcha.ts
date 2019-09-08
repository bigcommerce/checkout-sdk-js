import { Observable, Subject } from 'rxjs';

import { MutationObserverFactory } from '../../common/dom/mutation-observer';
import { NotInitializedError, NotInitializedErrorType } from '../../common/error/errors';

import { SpamProtectionFailedError, SpamProtectionNotCompletedError } from './errors';
import GoogleRecaptchaScriptLoader from './google-recaptcha-script-loader';

export interface RecaptchaResult {
    error?: Error;
    token?: string;
}

export default class GoogleRecaptcha {
    private _event$?: Subject<RecaptchaResult>;
    private _recaptcha?: ReCaptchaV2.ReCaptcha;

    constructor(
        private googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader,
        private mutationObserverFactory: MutationObserverFactory
    ) {}

    load(containerId: string, sitekey: string): Promise<void> {
        const event$ = new Subject<RecaptchaResult>();
        this._event$ = event$;

        return this.googleRecaptchaScriptLoader.load()
            .then(recaptcha => {
                recaptcha.render(containerId, {
                    sitekey,
                    size: 'invisible',
                    callback: () => {
                        event$.next({
                            token: recaptcha.getResponse(),
                        });
                        recaptcha.reset();
                    },
                    'error-callback': () => {
                        event$.next({
                            error: new SpamProtectionFailedError(),
                        });
                    },
                });

                this._recaptcha = recaptcha;
            });
    }

    execute(): Observable<RecaptchaResult> {
        if (!this._event$ || !this._recaptcha) {
            throw new NotInitializedError(NotInitializedErrorType.SpamProtectionNotInitialized);
        }

        this._watchRecaptchaChallengeWindow(this._event$);

        this._recaptcha.execute();

        return this._event$;
    }

    private _watchRecaptchaChallengeWindow(event: Subject<RecaptchaResult>) {
        const iframeElement = document.querySelector('iframe[title="recaptcha challenge"]');

        if (!iframeElement) {
            throw new Error('Recaptcha challenge iframe not found.');
        }

        const iframeContainer = iframeElement.parentElement;

        if (!iframeContainer) {
            throw new Error('Recaptcha challenge iframe container not found.');
        }

        const container = iframeContainer.parentElement;

        if (!container) {
            throw new Error('Recaptcha challenge container not found.');
        }

        this.mutationObserverFactory.create(() => {
            // When customer closes the Google ReCaptcha challenge window, throw SpamProtectionNotCompletedError
            if (container.style.visibility === 'hidden') {
                event.next({
                    error: new SpamProtectionNotCompletedError(),
                });
            }
        }).observe(container, { attributes: true, attributeFilter: ['style'] });
    }
}
