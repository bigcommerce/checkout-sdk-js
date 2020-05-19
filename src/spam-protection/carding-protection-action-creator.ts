import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { createScriptLoader } from '@bigcommerce/script-loader';
import { concat, defer, of } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../checkout';
import { throwErrorAction } from '../common/error';

import { createSpamProtection } from './';
import { SpamProtectionChallengeNotCompletedError, SpamProtectionFailedError } from './errors';
import GoogleRecaptcha from './google-recaptcha';
import { SpamProtectionAction, SpamProtectionActionType } from './spam-protection-actions';
import { SpamProtectionOptions } from './spam-protection-options';

export default class CardingProtectionActionCreator {
    _googleRecaptcha: GoogleRecaptcha;

    constructor(
        private _recaptchaSitekey: string
    ) {
        this._googleRecaptcha = createSpamProtection(createScriptLoader());
    }

    initialize(options?: SpamProtectionOptions): ThunkAction<SpamProtectionAction, InternalCheckoutSelectors> {
        return () => concat(
            of(createAction(SpamProtectionActionType.InitializeRequested, undefined)),
            defer(async () => {
                const cardingProtectionElementId = options ? options.containerId : 'cardingProtectionContainer';

                let cardingProtectionElement = document.getElementById(cardingProtectionElementId);
                if (cardingProtectionElement && cardingProtectionElement.parentNode) {
                    cardingProtectionElement.parentNode.removeChild(cardingProtectionElement);
                }

                cardingProtectionElement = document.createElement('div');
                cardingProtectionElement.setAttribute('id', cardingProtectionElementId);
                document.body.appendChild(cardingProtectionElement);

                await this._googleRecaptcha.load(cardingProtectionElementId, this._recaptchaSitekey);

                return createAction(SpamProtectionActionType.InitializeSucceeded);
            })
        ).pipe(
            catchError(error => throwErrorAction(SpamProtectionActionType.InitializeFailed, error))
        );
    }

    execute(): any {
        return (store: any) => defer(() => {
            return concat(
                of(createAction(SpamProtectionActionType.ExecuteRequested, undefined)),
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

                        return token;
                    }))
            ).pipe(
                catchError(error => throwErrorAction(SpamProtectionActionType.ExecuteFailed, error))
            );
        });
    }
}
