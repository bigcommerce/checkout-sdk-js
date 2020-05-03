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
        return store => defer(() => {
            const { checkout } = store.getState();
            const { id: checkoutId, shouldExecuteSpamCheck } = checkout.getCheckoutOrThrow();

            if (!shouldExecuteSpamCheck) {
                return empty();
            }

            return concat(
                of(createAction(SpamProtectionActionType.ExecuteRequested, undefined)),
                this.initialize()(store),
                this._googleRecaptcha.execute()
                    .pipe(take(1))
                    .pipe(switchMap(async ({ error, token }) => {
                        if (error || !token) {
                            throw new SpamProtectionFailedError();
                        }

                        const { body } = await this._requestSender.validate(checkoutId, token);

                        return createAction(SpamProtectionActionType.ExecuteSucceeded, body);
                    }))
            ).pipe(
                catchError(error => throwErrorAction(SpamProtectionActionType.ExecuteFailed, error))
            );
        });
    }
}
