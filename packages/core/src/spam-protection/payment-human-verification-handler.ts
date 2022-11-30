import { switchMap, take } from 'rxjs/operators';

import { RequestError } from '../common/error/errors';
import { PaymentAdditionalAction } from '../payment';

import {
    CardingProtectionChallengeNotCompletedError,
    CardingProtectionFailedError,
    SpamProtectionChallengeNotCompletedError,
} from './errors';
import GoogleRecaptcha from './google-recaptcha';

export default class PaymentHumanVerificationHandler {
    constructor(private _googleRecaptcha: GoogleRecaptcha) {}

    handle(error: Error): Promise<PaymentAdditionalAction>;
    handle(id: string, key: string): Promise<PaymentAdditionalAction>;
    async handle(errorOrId: Error | string, key?: string): Promise<PaymentAdditionalAction> {
        if (typeof errorOrId === 'string') {
            return this.handleWithRecaptchaSitekey(errorOrId, key);
        }

        return this.handleWithPaymentHumanVerificationRequestError(errorOrId);
    }

    private async handleWithPaymentHumanVerificationRequestError(
        error: Error,
    ): Promise<PaymentAdditionalAction> {
        if (!this._isPaymentHumanVerificationRequest(error)) {
            throw error;
        }

        await this._initialize(error.body.additional_action_required.data.key);

        return this._performRecaptcha();
    }

    private async handleWithRecaptchaSitekey(
        id: string,
        key?: string,
    ): Promise<PaymentAdditionalAction> {
        if (id !== 'recaptcha_v2') {
            throw Error('Human verification method is not supported.');
        }

        if (!key) {
            throw Error('Recaptcha site key is missing.');
        }

        await this._initialize(key);

        return this._performRecaptcha();
    }

    private _performRecaptcha(): Promise<PaymentAdditionalAction> {
        return this._googleRecaptcha
            .execute()
            .pipe(take(1))
            .pipe(
                switchMap(async ({ error, token }) => {
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
                }),
            )
            .toPromise();
    }

    private _initialize(recaptchaSitekey: string): Promise<void> {
        const cardingProtectionElementId = 'cardingProtectionContainer';

        let cardingProtectionElement = document.getElementById(cardingProtectionElementId);

        if (cardingProtectionElement && cardingProtectionElement.parentNode) {
            cardingProtectionElement.parentNode.removeChild(cardingProtectionElement);
        }

        cardingProtectionElement = document.createElement('div');
        cardingProtectionElement.setAttribute('id', cardingProtectionElementId);
        document.body.appendChild(cardingProtectionElement);

        return this._googleRecaptcha.load(cardingProtectionElementId, recaptchaSitekey);
    }

    private _isPaymentHumanVerificationRequest(error: Error): error is RequestError {
        const { additional_action_required, status } = (error as RequestError).body || {};

        return (
            status === 'additional_action_required' &&
            additional_action_required &&
            additional_action_required.type === 'recaptcha_v2_verification'
        );
    }
}
