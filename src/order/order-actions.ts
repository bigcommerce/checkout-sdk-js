import { Action } from '@bigcommerce/data-store';

import { InternalOrderResponseData } from './internal-order-responses';
import Order from './order';

export enum OrderActionType {
    LoadOrderRequested = 'LOAD_ORDER_REQUESTED',
    LoadOrderSucceeded = 'LOAD_ORDER_SUCCEEDED',
    LoadOrderFailed = 'LOAD_ORDER_FAILED',

    LoadInternalOrderRequested = 'LOAD_INTERNAL_ORDER_REQUESTED',
    LoadInternalOrderSucceeded = 'LOAD_INTERNAL_ORDER_SUCCEEDED',
    LoadInternalOrderFailed = 'LOAD_INTERNAL_ORDER_FAILED',

    SubmitOrderRequested = 'SUBMIT_ORDER_REQUESTED',
    SubmitOrderSucceeded = 'SUBMIT_ORDER_SUCCEEDED',
    SubmitOrderFailed = 'SUBMIT_ORDER_FAILED',

    FinalizeOrderRequested = 'FINALIZE_ORDER_REQUESTED',
    FinalizeOrderSucceeded = 'FINALIZE_ORDER_SUCCEEDED',
    FinalizeOrderFailed = 'FINALIZE_ORDER_FAILED',
}

export type OrderAction = LoadOrderAction |
    LoadInternalOrderAction |
    SubmitOrderAction |
    FinalizeOrderAction;

export type LoadOrderAction =
    LoadOrderRequestedAction |
    LoadOrderSucceededAction |
    LoadOrderFailedAction;

export type LoadInternalOrderAction =
    LoadInternalOrderRequestedAction |
    LoadInternalOrderRequestedAction |
    LoadInternalOrderSucceededAction;

export type SubmitOrderAction =
    SubmitOrderRequestedAction |
    SubmitOrderSucceededAction |
    SubmitOrderFailedAction;

export type FinalizeOrderAction =
    FinalizeOrderRequestedAction |
    FinalizeOrderSucceededAction |
    FinalizeOrderFailedAction;

export interface LoadOrderRequestedAction extends Action {
    type: OrderActionType.LoadOrderRequested;
}

export interface LoadOrderSucceededAction extends Action<Order> {
    type: OrderActionType.LoadOrderSucceeded;
}

export interface LoadOrderFailedAction extends Action<Error> {
    type: OrderActionType.LoadOrderFailed;
}

export interface LoadInternalOrderRequestedAction extends Action {
    type: OrderActionType.LoadInternalOrderRequested;
}

export interface LoadInternalOrderSucceededAction extends Action<InternalOrderResponseData> {
    type: OrderActionType.LoadInternalOrderSucceeded;
}

export interface LoadInternalOrderFailedAction extends Action<Error> {
    type: OrderActionType.LoadInternalOrderFailed;
}

export interface SubmitOrderRequestedAction extends Action {
    type: OrderActionType.SubmitOrderRequested;
}

export interface SubmitOrderSucceededAction extends Action<InternalOrderResponseData> {
    type: OrderActionType.SubmitOrderSucceeded;
}

export interface SubmitOrderFailedAction extends Action<Error> {
    type: OrderActionType.SubmitOrderFailed;
}

export interface FinalizeOrderRequestedAction extends Action {
    type: OrderActionType.FinalizeOrderRequested;
}

export interface FinalizeOrderSucceededAction extends Action<InternalOrderResponseData> {
    type: OrderActionType.FinalizeOrderSucceeded;
}

export interface FinalizeOrderFailedAction extends Action<Error> {
    type: OrderActionType.FinalizeOrderFailed;
}
