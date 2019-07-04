import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, of, throwError, Observable, Observer } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../../checkout';
import { MissingDataError, MissingDataErrorType } from '../../common/error/errors';

import GoogleRecaptcha from './google-recaptcha';
import { SpamProtectionAction, SpamProtectionActionType } from './spam-protection-actions';
import { SpamProtectionOptions } from './spam-protection-options';

export default class SpamProtectionActionCreator {
    constructor(
        private _googleRecaptcha: GoogleRecaptcha
    ) {}

    initialize(options: SpamProtectionOptions): ThunkAction<SpamProtectionAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<SpamProtectionAction>) => {
            const state = store.getState();
            const config = state.config.getConfig();
            const { containerId } = options;

            if (!config) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
            }

            observer.next(createAction(SpamProtectionActionType.InitializeRequested, undefined));

            const recaptchaSitekey = config.storeConfig.checkoutSettings.googleRecaptchaSitekey;

            return this._googleRecaptcha.load(containerId, recaptchaSitekey)
                .then(() => {
                    observer.next(createAction(SpamProtectionActionType.InitializeSucceeded));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(SpamProtectionActionType.InitializeFailed, error, containerId));
                });
        });
    }

    execute(): Observable<SpamProtectionAction> {
        return concat(
            of(createAction(SpamProtectionActionType.ExecuteRequested, undefined)),
            this._googleRecaptcha.execute()
                .pipe(take(1))
                .pipe(switchMap(({ error, token }) => {
                    return error ?
                        throwError(createErrorAction(SpamProtectionActionType.SubmitFailed, error)) :
                        of(createAction(SpamProtectionActionType.Completed, token));
                }))
        );
    }
}
