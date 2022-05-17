import { memoize } from '@bigcommerce/memoize';
import { defer, of, throwError, Observable, Subject } from 'rxjs';
import { catchError, delay, retryWhen, switchMap } from 'rxjs/operators';

import { MutationObserverFactory } from '../common/dom';
import { NotInitializedError, NotInitializedErrorType } from '../common/error/errors';

import { SpamProtectionChallengeNotCompletedError, SpamProtectionFailedError, SpamProtectionNotLoadedError } from './errors';
import GoogleRecaptchaScriptLoader from './google-recaptcha-script-loader';

const TIMEOUT = 7000;
const RETRY_INTERVAL = 250;
const MAX_RETRIES = TIMEOUT / RETRY_INTERVAL;

export interface RecaptchaResult {
    error?: Error;
    token?: string;
}

export default class GoogleRecaptcha {
    private _event$?: Subject<RecaptchaResult>;
    private _recaptcha?: ReCaptchaV2.ReCaptcha;
    private _memoized: (recaptcha: ReCaptchaV2.ReCaptcha, sitekey: string, container: HTMLElement | null) => Subject<RecaptchaResult>;
    private _widgetId?: number;

    constructor(
        private googleRecaptchaScriptLoader: GoogleRecaptchaScriptLoader,
        private mutationObserverFactory: MutationObserverFactory
    ) {
        this._memoized = memoize((recaptcha: ReCaptchaV2.ReCaptcha, sitekey: string, container: HTMLElement | null) => {
            const event$ = new Subject<RecaptchaResult>();

            if (!container) {
                throw new Error();
            }

            this._widgetId = recaptcha.render(container.id, {
                sitekey,
                size: 'invisible',
                callback: () => {
                    event$.next({
                        token: recaptcha.getResponse(this._widgetId),
                    });
                    recaptcha.reset(this._widgetId);
                },
                'error-callback': () => {
                    event$.next({
                        error: new SpamProtectionFailedError(),
                    });
                },
            });

            return event$;
        }, { isEqual: (a, b) => a === b });
    }

    load(containerId: string, sitekey: string): Promise<void> {
        return this.googleRecaptchaScriptLoader.load()
            .then(recaptcha => {
                this._event$ = this._memoized(recaptcha, sitekey, document.getElementById(containerId));

                this._recaptcha = recaptcha;
            });
    }

    execute(): Observable<RecaptchaResult> {
        return defer(() => {
            const event$ = this._event$;
            const recaptcha = this._recaptcha;

            if (!event$ || !recaptcha) {
                throw new NotInitializedError(NotInitializedErrorType.SpamProtectionNotInitialized);
            }

            return defer(() => {
                const element = document.querySelector('iframe[src*="bframe"]');

                return element ? of(element) : throwError(new SpamProtectionNotLoadedError());
            })
                .pipe(
                    retryWhen(errors => errors.pipe(
                        delay(RETRY_INTERVAL),
                        switchMap((error, index) =>
                            index < MAX_RETRIES ? of(error) : throwError(error)
                        )
                    )),
                    switchMap(element => {
                        this._watchRecaptchaChallengeWindow(event$, element);
                        recaptcha.execute(this._widgetId);

                        return event$;
                    }),
                    catchError(error => of({ error }))
                );
        });
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
                    error: new SpamProtectionChallengeNotCompletedError(),
                });
            }
        }).observe(container, { attributes: true, attributeFilter: ['style'] });
    }
}
