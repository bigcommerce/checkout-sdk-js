import { Action } from '@bigcommerce/data-store';

export enum SpamProtectionActionType {
    InitializeFailed = 'SPAM_PROTECTION_INITIALIZE_FAILED',
    InitializeSucceeded = 'SPAM_PROTECTION_INITIALIZE_SUCCEEDED',
    InitializeRequested = 'SPAM_PROTECTION_INITIALIZE_REQUESTED',
    Completed = 'SPAM_PROTECTION_COMPLETED',
    TokenExpired = 'SPAM_PROTECTION_TOKEN_EXPIRED',
}

export type SpamProtectionAction =
    InitializeRequestedAction |
    InitializeSucceededAction |
    InitializeFailedAction |
    CompletedAction |
    TokenExpiredAction;

export interface InitializeRequestedAction extends Action {
    type: SpamProtectionActionType.InitializeRequested;
}

export interface InitializeSucceededAction extends Action {
    type: SpamProtectionActionType.InitializeSucceeded;
}

export interface InitializeFailedAction extends Action<Error> {
    type: SpamProtectionActionType.InitializeFailed;
}

export interface CompletedAction extends Action<string> {
    type: SpamProtectionActionType.Completed;
}

export interface TokenExpiredAction extends Action {
    type: SpamProtectionActionType.TokenExpired;
}
