import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import { SignInEmail } from './signin-email';
import SignInEmailActionCreator from './signin-email-action-creator';
import { SignInEmailActionType } from './signin-email-actions';
import SignInEmailRequestSender from './signin-email-request-sender';

describe('SubscriptionsActionCreator', () => {
    let signInEmailActionCreator: SignInEmailActionCreator;
    let signInEmailRequestSender: SignInEmailRequestSender;
    let errorResponse: Response<Error>;
    let response: Response<SignInEmail>;

    beforeEach(() => {
        response = getResponse({ sent_email: 'f', expiry: 0 });
        errorResponse = getErrorResponse();
        signInEmailRequestSender = new SignInEmailRequestSender(createRequestSender());

        jest.spyOn(signInEmailRequestSender, 'sendSignInEmail').mockImplementation(() => Promise.resolve(response));

        signInEmailActionCreator = new SignInEmailActionCreator(
            signInEmailRequestSender
        );
    });

    describe('#sendSignInEmail()', () => {
        describe('when store has a signed-in shopper', () => {
            it('emits billing actions if able to continue as guest', async () => {
                const actions = await from(signInEmailActionCreator.sendSignInEmail('f'))
                    .pipe(toArray())
                    .toPromise();

                expect(actions).toEqual([
                    { type: SignInEmailActionType.SendSignInEmailRequested },
                    { type: SignInEmailActionType.SendSignInEmailSucceeded, payload: response.body },
                ]);
            });

            it('emits error actions if unable to continue as guest', async () => {
                jest.spyOn(signInEmailRequestSender, 'sendSignInEmail')
                    .mockReturnValue(Promise.reject(getErrorResponse()));

                const errorHandler = jest.fn(action => of(action));

                const actions = await from(signInEmailActionCreator.sendSignInEmail('f'))
                    .pipe(
                        catchError(errorHandler),
                        toArray()
                    )
                    .toPromise();

                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: SignInEmailActionType.SendSignInEmailRequested },
                    { type: SignInEmailActionType.SendSignInEmailFailed, payload: errorResponse, error: true },
                ]);
            });

            it('sends request to create billing address', async () => {
                await from(signInEmailActionCreator.sendSignInEmail('f', {}))
                    .toPromise();

                expect(signInEmailRequestSender.sendSignInEmail).toHaveBeenCalledWith('f', {});
            });
        });
    });
});
