import { defer, of, throwError, Observable, Subject } from 'rxjs';
import { catchError, delay, retryWhen, switchMap } from 'rxjs/operators';

import { MutationObserverFactory } from '../../common/dom';
import { NotInitializedError, NotInitializedErrorType } from '../../common/error/errors';

import {
    SpamProtectionFailedError,
    SpamProtectionNotCompletedError,
    SpamProtectionNotLoadedError,
} from './errors';
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
        const event$ = this._event$;
        const recaptcha = this._recaptcha;

        if (!event$ || !recaptcha) {
            throw new NotInitializedError(NotInitializedErrorType.SpamProtectionNotInitialized);
        }

        const timeout = 7000;
        const retryInterval = 250;
        const maxRetries = timeout / retryInterval;

        return defer(() => {
            const element = document.querySelector('iframe[src*="bframe"]');

            return element ?
                of(element) :
                throwError(new SpamProtectionNotLoadedError());
        })
            .pipe(
                retryWhen(errors => errors.pipe(
                    delay(retryInterval),
                    switchMap((error, index) =>
                        index < maxRetries ? of(error) : throwError(error)
                    )
                )),
                switchMap(element => {
                    this._watchRecaptchaChallengeWindow(event$, element);
                    recaptcha.execute();

                    return event$;
                }),
                catchError(error => of({ error }))
            );
    }

    private _watchRecaptchaChallengeWindow(event: Subject<RecaptchaResult>, element: Element) {
        const iframeContainer = element.parentElement;

        if (!iframeContainer) {
            throw new SpamProtectionNotLoadedError();
        }

        const container = iframeContainer.parentElement;

        if (!container) {
            throw new SpamProtectionNotLoadedError();
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
