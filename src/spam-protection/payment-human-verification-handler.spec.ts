import { ScriptLoader } from '@bigcommerce/script-loader';
import { ReplaySubject, Subject } from 'rxjs';

import { RequestError } from '../common/error/errors';
import { getErrorResponse, getErrorResponseBody } from '../common/http-request/responses.mock';

import { PaymentHumanVerificationHandler } from '.';
import createSpamProtection from './create-spam-protection';
import { CardingProtectionChallengeNotCompletedError, CardingProtectionFailedError, SpamProtectionChallengeNotCompletedError } from './errors';
import GoogleRecaptcha, { RecaptchaResult } from './google-recaptcha';

describe('PaymentHumanVerificationHandler', () => {
    let paymentHumanVerificationHandler: PaymentHumanVerificationHandler;
    let googleRecaptcha: GoogleRecaptcha;
    let $event: Subject<RecaptchaResult>;
    let errorResponse: RequestError;

    beforeEach(() => {
        errorResponse = {
            ...getErrorResponse(),
            body: {
                ...getErrorResponseBody(),
                status: 'additional_action_required',
                additional_action_required: {
                    type: 'recaptcha_v2_verification',
                    data: {
                        key: 'recaptchakey123',
                    },
                },
            },
            errors: [],
            name: '',
            type: '',
            message: '',
        };
        googleRecaptcha = createSpamProtection(new ScriptLoader());
        paymentHumanVerificationHandler = new PaymentHumanVerificationHandler(googleRecaptcha);
        jest.spyOn(googleRecaptcha, 'load').mockReturnValue(Promise.resolve());
        $event = new ReplaySubject<RecaptchaResult>();
        jest.spyOn(googleRecaptcha, 'execute').mockReturnValue($event);
    });

    describe('handle()', () => {
        it('runs _initialize() - creates a div container for GoogleRecaptcha rendering', () => {
            paymentHumanVerificationHandler.handle(errorResponse);

            expect(document.getElementById('cardingProtectionContainer')).toBeDefined();
        });

        it('runs _initialize() - loads GoogleRecaptcha using the provided site key', () => {
            paymentHumanVerificationHandler.handle(errorResponse);

            expect(googleRecaptcha.load).toHaveBeenCalledWith('cardingProtectionContainer', 'recaptchakey123');
        });

        it('throws the error if it\'s not a payment human verification request error', () => {
            errorResponse.body.status = 'some_other_error';

            return expect(paymentHumanVerificationHandler.handle(errorResponse)).rejects.toEqual(errorResponse);

        });

        it('returns the correct payment additional action', () => {
            $event.next({ token: 'googleRecaptchaToken' });

            return expect(paymentHumanVerificationHandler.handle(errorResponse)).resolves.toEqual({
                type: 'recaptcha_v2_verification',
                data: {
                    human_verification_token: 'googleRecaptchaToken',
                },
            });
        });

        it('throws CardingProtectionChallengeNotCompletedError if challenge not completed', () => {
            $event.next({ error: new SpamProtectionChallengeNotCompletedError() });

            return expect(paymentHumanVerificationHandler.handle(errorResponse))
                .rejects.toThrowError(new CardingProtectionChallengeNotCompletedError());
        });

        it('throws CardingProtectionFailedError if no token is returned', () => {
            $event.next({ token: undefined });

            return expect(paymentHumanVerificationHandler.handle(errorResponse))
                .rejects.toThrowError(new CardingProtectionFailedError());
        });

        it('rethrows error if error is not human verification error', () => {
            const error = new Error('foobar');

            expect(paymentHumanVerificationHandler.handle(error))
                .rejects.toThrowError(error);
        });
    });
});
