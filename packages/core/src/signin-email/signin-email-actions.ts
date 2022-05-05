import { Action } from '@bigcommerce/data-store';

import { SignInEmail } from './signin-email';

export enum SignInEmailActionType {
    SendSignInEmailRequested = 'SEND_SIGNIN_EMAIL_REQUESTED',
    SendSignInEmailSucceeded = 'SEND_SIGNIN_EMAIL_SUCCEEDED',
    SendSignInEmailFailed = 'SEND_SIGNIN_EMAIL_FAILED',
}
export type SendSignInEmailAction =
    SendSignInEmailRequestedAction |
    SendSignInEmailSucceededAction |
    SendSignInEmailFailedAction;

export interface SendSignInEmailRequestedAction extends Action {
    type: SignInEmailActionType.SendSignInEmailRequested;
}

export interface SendSignInEmailSucceededAction extends Action<SignInEmail> {
    type: SignInEmailActionType.SendSignInEmailSucceeded;
}

export interface SendSignInEmailFailedAction extends Action<Error> {
    type: SignInEmailActionType.SendSignInEmailFailed;
}
