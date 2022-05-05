import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, from, of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';

import { SpamProtectionChallengeNotCompletedError, SpamProtectionFailedError } from './errors';
import GoogleRecaptcha from './google-recaptcha';
import isSpamProtectionExecuteSucceededAction from './is-spam-protection-succeeded-action';
import { SpamProtectionAction, SpamProtectionActionType } from './spam-protection-actions';
import { SpamProtectionOptions } from './spam-protection-options';
import SpamProtectionRequestSender from './spam-protection-request-sender';

export default class SpamProtectionActionCreator {
    constructor(
        private _googleRecaptcha: GoogleRecaptcha,
        private _requestSender: SpamProtectionRequestSender
    ) {}

    initialize(options?: SpamProtectionOptions): ThunkAction<SpamProtectionAction, InternalCheckoutSelectors> {
        return store => concat(
            of(createAction(SpamProtectionActionType.InitializeRequested, undefined)),
            defer(async () => {
                const spamProtectionElementId = options ? options.containerId : 'spamProtectionContainer';

                if (!options && !document.getElementById(spamProtectionElementId)) {
                    const spamProtectionElement = document.createElement('div');
                    spamProtectionElement.setAttribute('id', spamProtectionElementId);
                    document.body.appendChild(spamProtectionElement);
                }

                const state = store.getState();
                const storeConfig = state.config.getStoreConfigOrThrow();
                const recaptchaSitekey = storeConfig.checkoutSettings.googleRecaptchaSitekey;

                await this._googleRecaptcha.load(spamProtectionElementId, recaptchaSitekey);

                return createAction(SpamProtectionActionType.InitializeSucceeded);
            })
        ).pipe(
            catchError(error => throwErrorAction(SpamProtectionActionType.InitializeFailed, error))
        );
    }

    verifyCheckoutSpamProtection(): ThunkAction<SpamProtectionAction> {
        return store => defer(() => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            return concat(
                of(createAction(SpamProtectionActionType.VerifyCheckoutRequested)),
                from(this.execute()(store))
                    .pipe(switchMap(action => {
                        if (!isSpamProtectionExecuteSucceededAction(action) || !action.payload) {
                            return of(action);
                        }

                        return from(this._requestSender.validate(checkout.id, action.payload.token))
                            .pipe(
                                switchMap(({ body }) => concat(
                                    of(action),
                                    of(createAction(SpamProtectionActionType.VerifyCheckoutSucceeded, body))
                                ))
                            );
                        })
                    )
            ).pipe(
                catchError(error => throwErrorAction(SpamProtectionActionType.VerifyCheckoutFailed, error))
            );
        });
    }

    execute(): ThunkAction<SpamProtectionAction, InternalCheckoutSelectors> {
        return store => concat(
                of(createAction(SpamProtectionActionType.ExecuteRequested)),
                this.initialize()(store),
                this._googleRecaptcha.execute()
                    .pipe(take(1))
                    .pipe(switchMap(async ({ error, token }) => {
                        if (error instanceof SpamProtectionChallengeNotCompletedError) {
                            throw error;
                        }

                        if (error || !token) {
                            throw new SpamProtectionFailedError();
                        }

                        return createAction(SpamProtectionActionType.ExecuteSucceeded, { token });
                    }))
            ).pipe(
                catchError(error => throwErrorAction(SpamProtectionActionType.ExecuteFailed, error))
            );
    }
}
