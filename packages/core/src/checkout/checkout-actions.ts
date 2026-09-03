import { Action } from '@bigcommerce/data-store';

import { LoadConfigAction } from '../config';
import { LoadFormFieldsAction } from '../form';

import Checkout from './checkout';

export enum CheckoutActionType {
    LoadCheckoutRequested = 'LOAD_CHECKOUT_REQUESTED',
    LoadCheckoutSucceeded = 'LOAD_CHECKOUT_SUCCEEDED',
    LoadCheckoutFailed = 'LOAD_CHECKOUT_FAILED',

    UpdateCheckoutRequested = 'UPDATE_CHECKOUT_REQUESTED',
    UpdateCheckoutSucceeded = 'UPDATE_CHECKOUT_SUCCEEDED',
    UpdateCheckoutFailed = 'UPDATE_CHECKOUT_FAILED',

    DeleteCheckoutRequested = 'DELETE_CHECKOUT_REQUESTED',
    DeleteCheckoutSucceeded = 'DELETE_CHECKOUT_SUCCEEDED',
    DeleteCheckoutFailed = 'DELETE_CHECKOUT_FAILED',

    ReportCheckoutEventRequested = 'REPORT_CHECKOUT_EVENT_REQUESTED',
    ReportCheckoutEventSucceeded = 'REPORT_CHECKOUT_EVENT_SUCCEEDED',
    ReportCheckoutEventFailed = 'REPORT_CHECKOUT_EVENT_FAILED',
}

export type CheckoutAction =
    | LoadCheckoutAction
    | UpdateCheckoutAction
    | DeleteCheckoutAction
    | ReportCheckoutEventAction;

export type LoadCheckoutAction =
    | LoadCheckoutRequestedAction
    | LoadCheckoutSucceededAction
    | LoadCheckoutFailedAction
    | LoadFormFieldsAction
    | LoadConfigAction;

export type UpdateCheckoutAction =
    | UpdateCheckoutRequestedAction
    | UpdateCheckoutSucceededAction
    | UpdateCheckoutFailedAction;

export type DeleteCheckoutAction =
    | DeleteCheckoutRequestedAction
    | DeleteCheckoutSucceededAction
    | DeleteCheckoutFailedAction;

export type ReportCheckoutEventAction =
    | ReportCheckoutEventRequestedAction
    | ReportCheckoutEventSucceededAction
    | ReportCheckoutEventFailedAction;

export interface LoadCheckoutRequestedAction extends Action {
    type: CheckoutActionType.LoadCheckoutRequested;
}

export interface LoadCheckoutSucceededAction extends Action<Checkout> {
    type: CheckoutActionType.LoadCheckoutSucceeded;
}

export interface LoadCheckoutFailedAction extends Action<Error> {
    type: CheckoutActionType.LoadCheckoutFailed;
}

export interface UpdateCheckoutRequestedAction extends Action {
    type: CheckoutActionType.UpdateCheckoutRequested;
}

export interface UpdateCheckoutSucceededAction extends Action<Checkout> {
    type: CheckoutActionType.UpdateCheckoutSucceeded;
}

export interface UpdateCheckoutFailedAction extends Action<Error> {
    type: CheckoutActionType.UpdateCheckoutFailed;
}

export interface DeleteCheckoutRequestedAction extends Action {
    type: CheckoutActionType.DeleteCheckoutRequested;
}

export interface DeleteCheckoutSucceededAction extends Action {
    type: CheckoutActionType.DeleteCheckoutSucceeded;
}

export interface DeleteCheckoutFailedAction extends Action<Error> {
    type: CheckoutActionType.DeleteCheckoutFailed;
}

export interface ReportCheckoutEventRequestedAction extends Action {
    type: CheckoutActionType.ReportCheckoutEventRequested;
}

export interface ReportCheckoutEventSucceededAction extends Action {
    type: CheckoutActionType.ReportCheckoutEventSucceeded;
}

export interface ReportCheckoutEventFailedAction extends Action {
    type: CheckoutActionType.ReportCheckoutEventFailed;
}
