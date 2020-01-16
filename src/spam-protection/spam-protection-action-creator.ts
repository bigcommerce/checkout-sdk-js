import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, empty, of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';

import { SpamProtectionFailedError } from './errors';
import GoogleRecaptcha from './google-recaptcha';
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
                const storeConfig = state.config.getStoreConfig();

                if (!storeConfig) {
                    throw new MissingDataError(MissingDataErrorType.MissingCheckoutConfig);
                }

                const recaptchaSitekey = storeConfig.checkoutSettings.googleRecaptchaSitekey;

                await this._googleRecaptcha.load(spamProtectionElementId, recaptchaSitekey);

                return createAction(SpamProtectionActionType.InitializeSucceeded);
            })
        ).pipe(
            catchError(error => throwErrorAction(SpamProtectionActionType.InitializeFailed, error))
        );
    }

    execute(): ThunkAction<SpamProtectionAction, InternalCheckoutSelectors> {
        return store => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError(MissingDataErrorType.MissingCheckout);
            }

            const { shouldExecuteSpamCheck } = checkout;

            if (!shouldExecuteSpamCheck) {
                return empty();
            }

            return concat(
                of(createAction(SpamProtectionActionType.ExecuteRequested, undefined)),
                this._googleRecaptcha.execute()
                    .pipe(take(1))
                    .pipe(switchMap(({ error, token }) => {
                        if (error || !token) {
                            throw new SpamProtectionFailedError();
                        }

                        return this._requestSender.validate(checkout.id, token)
                            .then(({ body }) => createAction(SpamProtectionActionType.ExecuteSucceeded, body));
                    }))
            ).pipe(
                catchError(error => throwErrorAction(SpamProtectionActionType.ExecuteFailed, error))
            );
        };
    }
}
