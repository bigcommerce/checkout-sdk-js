import { memoizeOne } from '@bigcommerce/memoize';

import { createSelector } from '../common/selector';

import { SignInEmail } from './signin-email';
import SignInEmailState, { DEFAULT_STATE } from './signin-email-state';

export default interface SignInEmailSelector {
    getEmail(): SignInEmail | undefined;
    getSendError(): Error | undefined;
    isSending(): boolean;
}

export type SignInEmailSelectorFactory = (state: SignInEmailState) => SignInEmailSelector;

export function createSignInEmailSelectorFactory(): SignInEmailSelectorFactory {
    const getEmail = createSelector(
        (state: SignInEmailState) => state.data,
        signInEmail => () => signInEmail
    );

    const getSendError = createSelector(
        (state: SignInEmailState) => state.errors.sendError,
        error => () => error
    );

    const isSending = createSelector(
        (state: SignInEmailState) => !!state.statuses.isSending,
        status => () => status
    );

    return memoizeOne((
        state: SignInEmailState = DEFAULT_STATE
    ): SignInEmailSelector => {
        return {
            getEmail: getEmail(state),
            getSendError: getSendError(state),
            isSending: isSending(state),
        };
    });
}
