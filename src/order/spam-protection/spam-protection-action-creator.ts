import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { InternalCheckoutSelectors } from '../../checkout';
import { MissingDataError, MissingDataErrorType } from '../../common/error/errors';

import GoogleRecaptcha from './google-recaptcha';
import { SpamProtectionAction, SpamProtectionActionType } from './spam-protection-actions';
import { SpamProtectionOptions } from './spam-protection-options';

export default class SpamProtectionActionCreator {
    constructor(
        private _googleRecaptcha: GoogleRecaptcha
    ) {}

    initialize(options: SpamProtectionOptions, callbacks: SpamProtectionCallbacks): ThunkAction<SpamProtectionAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<SpamProtectionAction>) => {
            const state = store.getState();
            const config = state.config.getConfig();
            const { containerId } = options;

            if (!config) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
            }

            observer.next(createAction(SpamProtectionActionType.InitializeRequested, undefined));

            const recaptchaSitekey = config.storeConfig.checkoutSettings.googleRecaptchaSitekey;

            return this._googleRecaptcha.render(containerId, recaptchaSitekey, {
                callback: callbacks.onComplete,
                'expired-callback': callbacks.onExpire,
            })
                .then(() => {
                    observer.next(createAction(SpamProtectionActionType.InitializeSucceeded));
                    observer.complete();
                })
                .catch(error => {
                    observer.error(createErrorAction(SpamProtectionActionType.InitializeFailed, error, containerId));
                });
        });
    }

    complete(token: string): SpamProtectionAction {
        return createAction(SpamProtectionActionType.Completed, token);
    }

    expire(): SpamProtectionAction {
        return createAction(SpamProtectionActionType.TokenExpired);
    }
}

export interface SpamProtectionCallbacks {
    onComplete(token: string): void;
    onExpire(): void;
}
