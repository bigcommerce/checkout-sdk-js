import { Action } from '@bigcommerce/data-store';

export enum CustomerContinueStrategyActionType {
    ExecuteBeforeContinueAsGuestFailed = 'CUSTOMER_CONTINUE_STRATEGY_EXECUTE_BEFORE_CONTINUE_AS_GUEST_FAILED',
    ExecuteBeforeContinueAsGuestRequested = 'CUSTOMER_CONTINUE_STRATEGY_EXECUTE_BEFORE_CONTINUE_AS_GUEST_REQUESTED',
    ExecuteBeforeContinueAsGuestSucceeded = 'CUSTOMER_CONTINUE_STRATEGY_EXECUTE_BEFORE_CONTINUE_AS_GUEST_SUCCEEDED',
    ExecuteBeforeSignInFailed = 'CUSTOMER_CONTINUE_STRATEGY_EXECUTE_BEFORE_SIGN_IN_FAILED',
    ExecuteBeforeSignInRequested = 'CUSTOMER_CONTINUE_STRATEGY_EXECUTE_BEFORE_SIGN_IN_REQUESTED',
    ExecuteBeforeSignInSucceeded = 'CUSTOMER_CONTINUE_STRATEGY_EXECUTE_BEFORE_SIGN_IN_SUCCEEDED',
    ExecuteBeforeSignUpFailed = 'CUSTOMER_CONTINUE_STRATEGY_EXECUTE_BEFORE_SIGN_UP_FAILED',
    ExecuteBeforeSignUpRequested = 'CUSTOMER_CONTINUE_STRATEGY_EXECUTE_BEFORE_SIGN_UP_REQUESTED',
    ExecuteBeforeSignUpSucceeded = 'CUSTOMER_CONTINUE_STRATEGY_EXECUTE_BEFORE_SIGN_UP_SUCCEEDED',
    InitializeFailed = 'CUSTOMER_CONTINUE_STRATEGY_INITIALIZE_FAILED',
    InitializeRequested = 'CUSTOMER_CONTINUE_STRATEGY_INITIALIZE_REQUESTED',
    InitializeSucceeded = 'CUSTOMER_CONTINUE_STRATEGY_INITIALIZE_SUCCEEDED',
    DeinitializeFailed = 'CUSTOMER_CONTINUE_STRATEGY_DEINITIALIZE_FAILED',
    DeinitializeRequested = 'CUSTOMER_CONTINUE_STRATEGY_DEINITIALIZE_REQUESTED',
    DeinitializeSucceeded = 'CUSTOMER_CONTINUE_STRATEGY_DEINITIALIZE_SUCCEEDED',
}

export type CustomerContinueStrategyAction =
    CustomerContinueStrategyInitializeAction |
    CustomerContinueStrategyDeinitializeAction |
    CustomerContinueStrategyExecuteBeforeSignInAction |
    CustomerContinueStrategyExecuteBeforeSignUpAction |
    CustomerContinueStrategyExecuteBeforeContinueAsGuestAction;

export type CustomerContinueStrategyInitializeAction =
    InitializeRequestedAction |
    InitializeSucceededAction |
    InitializeFailedAction;

export type CustomerContinueStrategyDeinitializeAction =
    DeinitializeRequestedAction |
    DeinitializeSucceededAction |
    DeinitializeFailedAction;

export type CustomerContinueStrategyExecuteBeforeSignInAction =
    ExecuteBeforeSignInRequestedAction |
    ExecuteBeforeSignInSucceededAction |
    ExecuteBeforeSignInFailedAction;

export type CustomerContinueStrategyExecuteBeforeSignUpAction =
    ExecuteBeforeSignUpRequestedAction |
    ExecuteBeforeSignUpSucceededAction |
    ExecuteBeforeSignUpFailedAction;

export type CustomerContinueStrategyExecuteBeforeContinueAsGuestAction =
    ExecuteBeforeContinueAsGuestRequestedAction |
    ExecuteBeforeContinueAsGuestSucceededAction |
    ExecuteBeforeContinueAsGuestFailedAction;

export interface InitializeRequestedAction extends Action {
    type: CustomerContinueStrategyActionType.InitializeRequested;
}

export interface InitializeSucceededAction extends Action {
    type: CustomerContinueStrategyActionType.InitializeSucceeded;
}

export interface InitializeFailedAction extends Action<Error> {
    type: CustomerContinueStrategyActionType.InitializeFailed;
}

export interface DeinitializeRequestedAction extends Action {
    type: CustomerContinueStrategyActionType.DeinitializeRequested;
}

export interface DeinitializeSucceededAction extends Action {
    type: CustomerContinueStrategyActionType.DeinitializeSucceeded;
}

export interface DeinitializeFailedAction extends Action<Error> {
    type: CustomerContinueStrategyActionType.DeinitializeFailed;
}

export interface ExecuteBeforeSignInRequestedAction extends Action {
    type: CustomerContinueStrategyActionType.ExecuteBeforeSignInRequested;
}

export interface ExecuteBeforeSignInSucceededAction extends Action {
    type: CustomerContinueStrategyActionType.ExecuteBeforeSignInSucceeded;
}

export interface ExecuteBeforeSignInFailedAction extends Action<Error> {
    type: CustomerContinueStrategyActionType.ExecuteBeforeSignInFailed;
}

export interface ExecuteBeforeSignUpRequestedAction extends Action {
    type: CustomerContinueStrategyActionType.ExecuteBeforeSignUpRequested;
}

export interface ExecuteBeforeSignUpSucceededAction extends Action {
    type: CustomerContinueStrategyActionType.ExecuteBeforeSignUpSucceeded;
}

export interface ExecuteBeforeSignUpFailedAction extends Action<Error> {
    type: CustomerContinueStrategyActionType.ExecuteBeforeSignUpFailed;
}

export interface ExecuteBeforeContinueAsGuestRequestedAction extends Action {
    type: CustomerContinueStrategyActionType.ExecuteBeforeContinueAsGuestRequested;
}

export interface ExecuteBeforeContinueAsGuestSucceededAction extends Action {
    type: CustomerContinueStrategyActionType.ExecuteBeforeContinueAsGuestSucceeded;
}

export interface ExecuteBeforeContinueAsGuestFailedAction extends Action<Error> {
    type: CustomerContinueStrategyActionType.ExecuteBeforeContinueAsGuestFailed;
}
