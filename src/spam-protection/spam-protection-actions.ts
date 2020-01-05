import { Action } from '@bigcommerce/data-store';

import { Checkout } from '../checkout';

export enum SpamProtectionActionType {
    InitializeFailed = 'SPAM_PROTECTION_INITIALIZE_FAILED',
    InitializeSucceeded = 'SPAM_PROTECTION_INITIALIZE_SUCCEEDED',
    InitializeRequested = 'SPAM_PROTECTION_INITIALIZE_REQUESTED',
    ExecuteRequested = 'SPAM_PROTECTION_EXECUTE_REQUESTED',
    ExecuteSucceeded = 'SPAM_PROTECTION_EXECUTE_SUCCEEDED',
    ExecuteFailed = 'SPAM_PROTECTION_EXECUTE_FAILED',
}

export type SpamProtectionAction =
    InitializeRequestedAction |
    InitializeSucceededAction |
    InitializeFailedAction |
    ExecuteRequestedAction |
    ExecuteSucceededAction |
    ExecuteFailedAction;

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

export interface ExecuteSucceededAction extends Action<Checkout> {
    type: SpamProtectionActionType.ExecuteSucceeded;
}

export interface ExecuteFailedAction extends Action {
    type: SpamProtectionActionType.ExecuteFailed;
}
