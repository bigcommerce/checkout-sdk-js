import { Action } from '@bigcommerce/data-store';

import { InternalOrderResponseData } from './internal-order-responses';
import Order from './order';

export enum OrderActionType {
    LoadOrderRequested = 'LOAD_ORDER_REQUESTED',
    LoadOrderSucceeded = 'LOAD_ORDER_SUCCEEDED',
    LoadOrderFailed = 'LOAD_ORDER_FAILED',

    LoadOrderPaymentsRequested = 'LOAD_ORDER_PAYMENTS_REQUESTED',
    LoadOrderPaymentsSucceeded = 'LOAD_ORDER_PAYMENTS_SUCCEEDED',
    LoadOrderPaymentsFailed = 'LOAD_ORDER_PAYMENTS_FAILED',

    SubmitOrderRequested = 'SUBMIT_ORDER_REQUESTED',
    SubmitOrderSucceeded = 'SUBMIT_ORDER_SUCCEEDED',
    SubmitOrderFailed = 'SUBMIT_ORDER_FAILED',

    FinalizeOrderRequested = 'FINALIZE_ORDER_REQUESTED',
    FinalizeOrderSucceeded = 'FINALIZE_ORDER_SUCCEEDED',
    FinalizeOrderFailed = 'FINALIZE_ORDER_FAILED',
}

export type OrderAction = LoadOrderAction |
    LoadOrderPaymentsAction |
    SubmitOrderAction |
    FinalizeOrderAction;

export type LoadOrderPaymentsAction = LoadOrderPaymentsRequestedAction |
    LoadOrderPaymentsSucceededAction |
    LoadOrderPaymentsFailedAction;

export type LoadOrderAction =
    LoadOrderRequestedAction |
    LoadOrderSucceededAction |
    LoadOrderFailedAction;

export type SubmitOrderAction =
    SubmitOrderRequestedAction |
    SubmitOrderSucceededAction |
    SubmitOrderFailedAction |
    LoadOrderAction;

export type FinalizeOrderAction =
    FinalizeOrderRequestedAction |
    FinalizeOrderSucceededAction |
    FinalizeOrderFailedAction |
    LoadOrderAction;

export interface LoadOrderRequestedAction extends Action {
    type: OrderActionType.LoadOrderRequested;
}

export interface LoadOrderSucceededAction extends Action<Order> {
    type: OrderActionType.LoadOrderSucceeded;
}

export interface LoadOrderFailedAction extends Action<Error> {
    type: OrderActionType.LoadOrderFailed;
}

export interface LoadOrderPaymentsRequestedAction extends Action {
    type: OrderActionType.LoadOrderPaymentsRequested;
}

export interface LoadOrderPaymentsSucceededAction extends Action<Order> {
    type: OrderActionType.LoadOrderPaymentsSucceeded;
}

export interface LoadOrderPaymentsFailedAction extends Action<Error> {
    type: OrderActionType.LoadOrderPaymentsFailed;
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
