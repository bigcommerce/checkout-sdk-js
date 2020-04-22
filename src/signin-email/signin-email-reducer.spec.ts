import { createAction } from '@bigcommerce/data-store';

import { RequestError } from '../common/error/errors';
import { getErrorResponse } from '../common/http-request/responses.mock';

import { SignInEmail } from './signin-email';
import { SignInEmailActionType } from './signin-email-actions';
import signInEmailReducer from './signin-email-reducer';
import SignInEmailState from './signin-email-state';

describe('signInEmailReducer', () => {
    let initialState: SignInEmailState;

    beforeEach(() => {
        initialState = { errors: {}, statuses: {} };
    });

    it('returns pending when subscriptions update requested', () => {
        const action = createAction(SignInEmailActionType.SendSignInEmailRequested);
        const output = signInEmailReducer(initialState, action);

        expect(output).toEqual({
            data: undefined,
            errors: { sendError: undefined },
            statuses: { isSending: true },
        });
    });

    it('returns clean state when subscriptions updated', () => {
        const email: SignInEmail = { sent_email: 'f', expiry: 0 };
        const action = createAction(SignInEmailActionType.SendSignInEmailSucceeded, email);
        const output = signInEmailReducer(initialState, action);

        expect(output).toEqual({
            data: action.payload,
            errors: { sendError: undefined },
            statuses: { isSending: false },
        });
    });

    it('returns error when subscriptions failed to update', () => {
        const action = createAction(SignInEmailActionType.SendSignInEmailFailed, new RequestError(getErrorResponse()));
        const output = signInEmailReducer(initialState, action);

        expect(output).toEqual({
            data: undefined,
            errors: { sendError: action.payload },
            statuses: { isSending: false },
        });
    });
});
