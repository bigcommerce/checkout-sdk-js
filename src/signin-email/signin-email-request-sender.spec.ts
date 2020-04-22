import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';

import { ContentType } from '../common/http-request';

import SignInEmailRequestSender from './signin-email-request-sender';

describe('SignInEmailRequestSender', () => {
    let signInEmailRequestSender: SignInEmailRequestSender;
    let requestSender: RequestSender;

    beforeEach(() => {
        requestSender = createRequestSender();

        jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve());

        signInEmailRequestSender = new SignInEmailRequestSender(requestSender);
    });

    describe('#sendSignInEmail()', () => {
        it('sends sign-in email', async () => {
            await signInEmailRequestSender.sendSignInEmail('foo');

            expect(requestSender.post).toHaveBeenCalledWith(
                '/login.php?action=passwordless_login',
                {
                    body: { email: 'foo' },
                    headers: { Accept: ContentType.JsonV1 },
                    timeout: undefined,
                }
            );
        });

        it('sends sign-in email with timeout', async () => {
            const options = { timeout: createTimeout() };
            await signInEmailRequestSender.sendSignInEmail('foo', options);

            expect(requestSender.post).toHaveBeenCalledWith(
                '/login.php?action=passwordless_login',
                {
                    ...options,
                    body: { email: 'foo' },
                    headers: { Accept: ContentType.JsonV1 },
                }
            );
        });
    });
});
