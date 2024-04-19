import { SignInEmail } from './signin-email';

export default interface SignInEmailState {
    data?: SignInEmail;
    errors: SignInEmailErrorsState;
    statuses: SignInEmailStatusesState;
}

export interface SignInEmailErrorsState {
    sendError?: Error;
}

export interface SignInEmailStatusesState {
    isSending?: boolean;
}

export const DEFAULT_STATE: SignInEmailState = {
    errors: {},
    statuses: {},
};
