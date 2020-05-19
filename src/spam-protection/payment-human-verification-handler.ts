import { createScriptLoader } from '@bigcommerce/script-loader';
import { concat, defer, Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { createSpamProtection } from './';
import { CardingProtectionChallengeNotCompletedError, CardingProtectionFailedError, SpamProtectionChallengeNotCompletedError } from './errors';
import GoogleRecaptcha from './google-recaptcha';
import { SpamProtectionOptions } from './spam-protection-options';

export default class PaymentHumanVerificationHandler {
    _googleRecaptcha: GoogleRecaptcha;

    constructor(
        private _recaptchaSitekey: string
    ) {
        this._googleRecaptcha = createSpamProtection(createScriptLoader());
    }

    async initialize(options?: SpamProtectionOptions): Promise<void> {
        const cardingProtectionElementId = options ? options.containerId : 'cardingProtectionContainer';

        let cardingProtectionElement = document.getElementById(cardingProtectionElementId);
        if (cardingProtectionElement && cardingProtectionElement.parentNode) {
                cardingProtectionElement.parentNode.removeChild(cardingProtectionElement);
            }

        cardingProtectionElement = document.createElement('div');
        cardingProtectionElement.setAttribute('id', cardingProtectionElementId);
        document.body.appendChild(cardingProtectionElement);

        return await this._googleRecaptcha.load(cardingProtectionElementId, this._recaptchaSitekey);
    }

    execute(): Observable<any> {
        return defer(() => {
            return concat(
                this.initialize(),
                this._googleRecaptcha.execute()
                    .pipe(take(1))
                    .pipe(switchMap(async ({ error, token }) => {
                        if (error instanceof SpamProtectionChallengeNotCompletedError) {
                            throw new CardingProtectionChallengeNotCompletedError();
                        }

                        if (error || !token) {
                            throw new CardingProtectionFailedError();
                        }

                        return {
                            type: 'recaptcha_v2_verification',
                            data: {
                                human_verification_token: token,
                            },
                        };
                    }))
            );
        });
    }
}
