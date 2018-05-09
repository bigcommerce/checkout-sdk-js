import { Action } from '@bigcommerce/data-store';

export enum PaymentStrategyActionType {
    ExecuteFailed = 'PAYMENT_STRATEGY_EXECUTE_FAILED',
    ExecuteRequested = 'PAYMENT_STRATEGY_EXECUTE_REQUESTED',
    ExecuteSucceeded = 'PAYMENT_STRATEGY_EXECUTE_SUCCEEDED',
    FinalizeFailed = 'PAYMENT_STRATEGY_FINALIZE_FAILED',
    FinalizeRequested = 'PAYMENT_STRATEGY_FINALIZE_REQUESTED',
    FinalizeSucceeded = 'PAYMENT_STRATEGY_FINALIZE_SUCCEEDED',
    InitializeFailed = 'PAYMENT_STRATEGY_INITIALIZE_FAILED',
    InitializeRequested = 'PAYMENT_STRATEGY_INITIALIZE_REQUESTED',
    InitializeSucceeded = 'PAYMENT_STRATEGY_INITIALIZE_SUCCEEDED',
    DeinitializeFailed = 'PAYMENT_STRATEGY_DEINITIALIZE_FAILED',
    DeinitializeRequested = 'PAYMENT_STRATEGY_DEINITIALIZE_REQUESTED',
    DeinitializeSucceeded = 'PAYMENT_STRATEGY_DEINITIALIZE_SUCCEEDED',
}

export type PaymentStrategyAction =
    Action |
    PaymentStrategyExecuteAction |
    PaymentStrategyFinalizeAction |
    PaymentStrategyInitializeAction |
    PaymentStrategyDeinitializeAction;

export type PaymentStrategyExecuteAction =
    ExecuteRequestedAction |
    ExecuteSucceededAction |
    ExecuteFailedAction;

export type PaymentStrategyFinalizeAction =
    FinalizeRequestedAction |
    FinalizeSucceededAction |
    FinalizeFailedAction;

export type PaymentStrategyInitializeAction =
    InitializeRequestedAction |
    InitializeSucceededAction |
    InitializeFailedAction;

export type PaymentStrategyDeinitializeAction =
    DeinitializeRequestedAction |
    DeinitializeSucceededAction |
    DeinitializeFailedAction;

export interface ExecuteRequestedAction extends Action {
    type: PaymentStrategyActionType.ExecuteRequested;
}

export interface ExecuteSucceededAction extends Action {
    type: PaymentStrategyActionType.ExecuteSucceeded;
}

export interface ExecuteFailedAction extends Action<Error> {
    type: PaymentStrategyActionType.ExecuteFailed;
}

export interface FinalizeRequestedAction extends Action {
    type: PaymentStrategyActionType.FinalizeRequested;
}

export interface FinalizeSucceededAction extends Action {
    type: PaymentStrategyActionType.FinalizeSucceeded;
}

export interface FinalizeFailedAction extends Action<Error> {
    type: PaymentStrategyActionType.FinalizeFailed;
}

export interface InitializeRequestedAction extends Action {
    type: PaymentStrategyActionType.InitializeRequested;
}

export interface InitializeSucceededAction extends Action {
    type: PaymentStrategyActionType.InitializeSucceeded;
}

export interface InitializeFailedAction extends Action<Error> {
    type: PaymentStrategyActionType.InitializeFailed;
}

export interface DeinitializeRequestedAction extends Action {
    type: PaymentStrategyActionType.DeinitializeRequested;
}

export interface DeinitializeSucceededAction extends Action {
    type: PaymentStrategyActionType.DeinitializeSucceeded;
}

export interface DeinitializeFailedAction extends Action<Error> {
    type: PaymentStrategyActionType.DeinitializeFailed;
}
