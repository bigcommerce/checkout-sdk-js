import { Action } from '@bigcommerce/data-store';

export enum SpamProtectionActionType {
    InitializeFailed = 'SPAM_PROTECTION_INITIALIZE_FAILED',
    InitializeSucceeded = 'SPAM_PROTECTION_INITIALIZE_SUCCEEDED',
    InitializeRequested = 'SPAM_PROTECTION_INITIALIZE_REQUESTED',
    ExecuteRequested = 'SPAM_PROTECTION_EXECUTE_REQUESTED',
    Completed = 'SPAM_PROTECTION_COMPLETED',
    SubmitFailed = 'SPAM_PROTECTION_SUBMIT_FAILED',
}

export type SpamProtectionAction =
    InitializeRequestedAction |
    InitializeSucceededAction |
    InitializeFailedAction |
    ExecuteRequestedAction |
    CompletedAction |
    SubmitFailedAction;

export interface InitializeRequestedAction extends Action {
    type: SpamProtectionActionType.InitializeRequested;
}

export interface InitializeSucceededAction extends Action {
    type: SpamProtectionActionType.InitializeSucceeded;
}

export interface InitializeFailedAction extends Action<Error> {
    type: SpamProtectionActionType.InitializeFailed;
}

export interface ExecuteRequestedAction extends Action {
    type: SpamProtectionActionType.ExecuteRequested;
}

export interface CompletedAction extends Action<string> {
    type: SpamProtectionActionType.Completed;
}

export interface SubmitFailedAction extends Action {
    type: SpamProtectionActionType.SubmitFailed;
}
