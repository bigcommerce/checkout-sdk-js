import { SignInEmail } from './signin-email';
import SignInEmailSelector, { createSignInEmailSelectorFactory, SignInEmailSelectorFactory } from './signin-email-selector';

describe('SignInEmailSelector', () => {
    let signInEmailSelector: SignInEmailSelector;
    let createSignInEmailSelector: SignInEmailSelectorFactory;

    beforeEach(() => {
        createSignInEmailSelector = createSignInEmailSelectorFactory();
    });

    describe('#getEmail()', () => {
        it('returns email if present', () => {
            const email: SignInEmail = {
                sent_email: 'f',
                expiry: 0,
            };

            signInEmailSelector = createSignInEmailSelector({
                data: email,
                errors: {},
                statuses: {},
            });

            expect(signInEmailSelector.getEmail()).toEqual(email);
        });

        it('returns no error if not present', () => {
            signInEmailSelector = createSignInEmailSelector({
                errors: {},
                statuses: {},
            });

            expect(signInEmailSelector.getSendError()).toBeUndefined();
        });
    });

    describe('#getSendError()', () => {
        it('returns error if present', () => {
            const sendError = new Error();

            signInEmailSelector = createSignInEmailSelector({
                errors: { sendError },
                statuses: {},
            });

            expect(signInEmailSelector.getSendError()).toEqual(sendError);
        });

        it('returns no error if not present', () => {
            signInEmailSelector = createSignInEmailSelector({
                errors: {},
                statuses: {},
            });

            expect(signInEmailSelector.getSendError()).toBeUndefined();
        });
    });

    describe('#isUpdating()', () => {
        it('returns true if sending email', () => {
            signInEmailSelector = createSignInEmailSelector({
                errors: {},
                statuses: { isSending: true },
            });

            expect(signInEmailSelector.isSending()).toEqual(true);
        });

        it('returns false if not sending email', () => {
            signInEmailSelector = createSignInEmailSelector({
                errors: {},
                statuses: {},
            });

            expect(signInEmailSelector.isSending()).toEqual(false);
        });
    });
});
