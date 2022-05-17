import { Action } from '@bigcommerce/data-store';

import { Checkout } from '../checkout';

export enum SpamProtectionActionType {
    InitializeFailed = 'SPAM_PROTECTION_INITIALIZE_FAILED',
    InitializeSucceeded = 'SPAM_PROTECTION_INITIALIZE_SUCCEEDED',
    InitializeRequested = 'SPAM_PROTECTION_INITIALIZE_REQUESTED',
    VerifyCheckoutRequested = 'SPAM_PROTECTION_CHECKOUT_VERIFY_REQUESTED',
    VerifyCheckoutSucceeded = 'SPAM_PROTECTION_CHECKOUT_VERIFY_SUCCEEDED',
    VerifyCheckoutFailed = 'SPAM_PROTECTION_CHECKOUT_VERIFY_FAILED',
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
    ExecuteFailedAction |
    CheckoutVerifyRequestedAction |
    CheckoutVerifyFailedAction |
    CheckoutVerifySucceededAction;

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

export interface ExecuteSucceededAction extends Action<{ token: string }> {
    type: SpamProtectionActionType.ExecuteSucceeded;
}

export interface ExecuteFailedAction extends Action {
    type: SpamProtectionActionType.ExecuteFailed;
}

export interface CheckoutVerifyRequestedAction extends Action {
    type: SpamProtectionActionType.VerifyCheckoutRequested;
}

export interface CheckoutVerifyFailedAction extends Action<Error> {
    type: SpamProtectionActionType.VerifyCheckoutFailed;
}

export interface CheckoutVerifySucceededAction extends Action<Checkout> {
    type: SpamProtectionActionType.VerifyCheckoutSucceeded;
}
