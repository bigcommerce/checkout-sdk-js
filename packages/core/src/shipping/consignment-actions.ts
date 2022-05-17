import { Action } from '@bigcommerce/data-store';

import { Checkout } from '../checkout';

import { ConsignmentMeta } from './consignment';

export enum ConsignmentActionType {
    CreateConsignmentsRequested = 'CREATE_CONSIGNMENTS_REQUESTED',
    CreateConsignmentsSucceeded = 'CREATE_CONSIGNMENTS_SUCCEEDED',
    CreateConsignmentsFailed = 'CREATE_CONSIGNMENTS_FAILED',

    UpdateConsignmentRequested = 'UPDATE_CONSIGNMENT_REQUESTED',
    UpdateConsignmentSucceeded = 'UPDATE_CONSIGNMENT_SUCCEEDED',
    UpdateConsignmentFailed = 'UPDATE_CONSIGNMENT_FAILED',

    DeleteConsignmentRequested = 'DELETE_CONSIGNMENT_REQUESTED',
    DeleteConsignmentSucceeded = 'DELETE_CONSIGNMENT_SUCCEEDED',
    DeleteConsignmentFailed = 'DELETE_CONSIGNMENT_FAILED',

    UpdateShippingOptionRequested = 'UPDATE_SHIPPING_OPTION_REQUESTED',
    UpdateShippingOptionSucceeded = 'UPDATE_SHIPPING_OPTION_SUCCEEDED',
    UpdateShippingOptionFailed = 'UPDATE_SHIPPING_OPTION_FAILED',

    LoadShippingOptionsRequested = 'LOAD_SHIPPING_OPTIONS_REQUESTED',
    LoadShippingOptionsSucceeded = 'LOAD_SHIPPING_OPTIONS_SUCCEEDED',
    LoadShippingOptionsFailed = 'LOAD_SHIPPING_OPTIONS_FAILED',
}

export type ConsignmentAction =
    CreateConsignmentsAction |
    UpdateConsignmentAction |
    DeleteConsignmentAction |
    UpdateShippingOptionAction |
    LoadShippingOptionsAction;

export type CreateConsignmentsAction =
    CreateConsignmentsRequestedAction |
    CreateConsignmentsSucceededAction |
    CreateConsignmentsFailedAction;

export type UpdateConsignmentAction =
    UpdateConsignmentRequestedAction |
    UpdateConsignmentSucceededAction |
    UpdateConsignmentFailedAction;

export type DeleteConsignmentAction =
    DeleteConsignmentRequestedAction |
    DeleteConsignmentSucceededAction |
    DeleteConsignmentFailedAction;

export type UpdateShippingOptionAction =
    UpdateShippingOptionRequestedAction |
    UpdateShippingOptionSucceededAction |
    UpdateShippingOptionFailedAction;

export type LoadShippingOptionsAction =
    LoadShippingOptionsRequestedAction |
    LoadShippingOptionsSucceededAction |
    LoadShippingOptionsFailedAction;

export interface CreateConsignmentsRequestedAction extends Action {
    type: ConsignmentActionType.CreateConsignmentsRequested;
}

export interface CreateConsignmentsSucceededAction extends Action<Checkout> {
    type: ConsignmentActionType.CreateConsignmentsSucceeded;
}

export interface CreateConsignmentsFailedAction extends Action<Error> {
    type: ConsignmentActionType.CreateConsignmentsFailed;
}

export interface UpdateConsignmentRequestedAction extends Action<null, ConsignmentMeta> {
    type: ConsignmentActionType.UpdateConsignmentRequested;
}

export interface UpdateConsignmentSucceededAction extends Action<Checkout, ConsignmentMeta> {
    type: ConsignmentActionType.UpdateConsignmentSucceeded;
}

export interface UpdateConsignmentFailedAction extends Action<Error, ConsignmentMeta> {
    type: ConsignmentActionType.UpdateConsignmentFailed;
}

export interface DeleteConsignmentRequestedAction extends Action<null, ConsignmentMeta> {
    type: ConsignmentActionType.DeleteConsignmentRequested;
}

export interface DeleteConsignmentSucceededAction extends Action<Checkout, ConsignmentMeta> {
    type: ConsignmentActionType.DeleteConsignmentSucceeded;
}

export interface DeleteConsignmentFailedAction extends Action<Error, ConsignmentMeta> {
    type: ConsignmentActionType.DeleteConsignmentFailed;
}

export interface UpdateShippingOptionRequestedAction extends Action<null, ConsignmentMeta> {
    type: ConsignmentActionType.UpdateShippingOptionRequested;
}

export interface UpdateShippingOptionSucceededAction extends Action<Checkout, ConsignmentMeta> {
    type: ConsignmentActionType.UpdateShippingOptionSucceeded;
}

export interface UpdateShippingOptionFailedAction extends Action<Error, ConsignmentMeta> {
    type: ConsignmentActionType.UpdateShippingOptionFailed;
}

export interface LoadShippingOptionsRequestedAction extends Action {
    type: ConsignmentActionType.LoadShippingOptionsRequested;
}

export interface LoadShippingOptionsSucceededAction extends Action<Checkout> {
    type: ConsignmentActionType.LoadShippingOptionsSucceeded;
}

export interface LoadShippingOptionsFailedAction extends Action<Error> {
    type: ConsignmentActionType.LoadShippingOptionsFailed;
}
