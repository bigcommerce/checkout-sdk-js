import { Action } from '@bigcommerce/data-store';

import { LoadOrderPaymentsAction } from '../order';

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
    WidgetInteractionStarted = 'PAYMENT_STRATEGY_WIDGET_INTERACTION_STARTED',
    WidgetInteractionFinished = 'PAYMENT_STRATEGY_WIDGET_INTERACTION_FINISHED',
    WidgetInteractionFailed = 'PAYMENT_STRATEGY_WIDGET_INTERACTION_FAILED',
    EmbeddedSubmitButtonStarted = 'PAYMENT_STRATEGY_EMBEDDED_SUBMIT_STARTED',
    EmbeddedSubmitButtonFinished = 'PAYMENT_STRATEGY_EMBEDDED_SUBMIT_FINISHED',
}

export type PaymentStrategyAction =
    PaymentStrategyExecuteAction |
    PaymentStrategyFinalizeAction |
    PaymentStrategyInitializeAction |
    PaymentStrategyDeinitializeAction |
    PaymentStrategyWidgetAction |
    PaymentStrategyEmbeddedSubmitButton;

export type PaymentStrategyExecuteAction =
    ExecuteRequestedAction |
    ExecuteSucceededAction |
    ExecuteFailedAction |
    LoadOrderPaymentsAction;

export type PaymentStrategyFinalizeAction =
    FinalizeRequestedAction |
    FinalizeSucceededAction |
    FinalizeFailedAction |
    LoadOrderPaymentsAction;

export type PaymentStrategyInitializeAction =
    InitializeRequestedAction |
    InitializeSucceededAction |
    InitializeFailedAction;

export type PaymentStrategyDeinitializeAction =
    DeinitializeRequestedAction |
    DeinitializeSucceededAction |
    DeinitializeFailedAction;

export type PaymentStrategyWidgetAction =
    WidgetInteractionStartedAction |
    WidgetInteractionFinishedAction |
    WidgetInteractionFailedAction;

export type PaymentStrategyEmbeddedSubmitButton =
    EmbeddedSubmitButtonStartedAction |
    EmbeddedSubmitButtonFinishedAction;

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

export interface WidgetInteractionStartedAction extends Action {
    type: PaymentStrategyActionType.WidgetInteractionStarted;
}

export interface WidgetInteractionFinishedAction extends Action {
    type: PaymentStrategyActionType.WidgetInteractionFinished;
}

export interface WidgetInteractionFailedAction extends Action<Error> {
    type: PaymentStrategyActionType.WidgetInteractionFailed;
}

export interface EmbeddedSubmitButtonStartedAction extends Action {
    type: PaymentStrategyActionType.EmbeddedSubmitButtonStarted;
}

export interface EmbeddedSubmitButtonFinishedAction extends Action {
    type: PaymentStrategyActionType.EmbeddedSubmitButtonFinished;
}
