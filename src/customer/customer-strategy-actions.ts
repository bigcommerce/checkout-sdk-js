import { Action } from '@bigcommerce/data-store';

export enum CustomerStrategyActionType {
    SignInFailed = 'CUSTOMER_STRATEGY_SIGN_IN_FAILED',
    SignInRequested = 'CUSTOMER_STRATEGY_SIGN_IN_REQUESTED',
    SignInSucceeded = 'CUSTOMER_STRATEGY_SIGN_IN_SUCCEEDED',
    SignOutFailed = 'CUSTOMER_STRATEGY_SIGN_OUT_FAILED',
    SignOutRequested = 'CUSTOMER_STRATEGY_SIGN_OUT_REQUESTED',
    SignOutSucceeded = 'CUSTOMER_STRATEGY_SIGN_OUT_SUCCEEDED',
    InitializeFailed = 'CUSTOMER_STRATEGY_INITIALIZE_FAILED',
    InitializeRequested = 'CUSTOMER_STRATEGY_INITIALIZE_REQUESTED',
    InitializeSucceeded = 'CUSTOMER_STRATEGY_INITIALIZE_SUCCEEDED',
    DeinitializeFailed = 'CUSTOMER_STRATEGY_DEINITIALIZE_FAILED',
    DeinitializeRequested = 'CUSTOMER_STRATEGY_DEINITIALIZE_REQUESTED',
    DeinitializeSucceeded = 'CUSTOMER_STRATEGY_DEINITIALIZE_SUCCEEDED',
}

export type CustomerStrategyAction =
    CustomerStrategySignInAction |
    CustomerStrategySignOutAction |
    CustomerStrategyInitializeAction |
    CustomerStrategyDeinitializeAction;

export type CustomerStrategySignInAction =
    SignInRequestedAction |
    SignInSucceededAction |
    SignInFailedAction;

export type CustomerStrategySignOutAction =
    SignOutRequestedAction |
    SignOutSucceededAction |
    SignOutFailedAction;

export type CustomerStrategyInitializeAction =
    InitializeRequestedAction |
    InitializeSucceededAction |
    InitializeFailedAction;

export type CustomerStrategyDeinitializeAction =
    DeinitializeRequestedAction |
    DeinitializeSucceededAction |
    DeinitializeFailedAction;

export interface SignInRequestedAction extends Action {
    type: CustomerStrategyActionType.SignInRequested;
}

export interface SignInSucceededAction extends Action {
    type: CustomerStrategyActionType.SignInSucceeded;
}

export interface SignInFailedAction extends Action<Error> {
    type: CustomerStrategyActionType.SignInFailed;
}

export interface SignOutRequestedAction extends Action {
    type: CustomerStrategyActionType.SignOutRequested;
}

export interface SignOutSucceededAction extends Action {
    type: CustomerStrategyActionType.SignOutSucceeded;
}

export interface SignOutFailedAction extends Action<Error> {
    type: CustomerStrategyActionType.SignOutFailed;
}

export interface InitializeRequestedAction extends Action {
    type: CustomerStrategyActionType.InitializeRequested;
}

export interface InitializeSucceededAction extends Action {
    type: CustomerStrategyActionType.InitializeSucceeded;
}

export interface InitializeFailedAction extends Action<Error> {
    type: CustomerStrategyActionType.InitializeFailed;
}

export interface DeinitializeRequestedAction extends Action {
    type: CustomerStrategyActionType.DeinitializeRequested;
}

export interface DeinitializeSucceededAction extends Action {
    type: CustomerStrategyActionType.DeinitializeSucceeded;
}

export interface DeinitializeFailedAction extends Action<Error> {
    type: CustomerStrategyActionType.DeinitializeFailed;
}
