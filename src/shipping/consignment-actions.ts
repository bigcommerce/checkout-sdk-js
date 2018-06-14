import { Action } from '@bigcommerce/data-store';

import { Checkout } from '../checkout';

export enum ConsignmentActionType {
    CreateConsignmentsRequested = 'CREATE_CONSIGNMENTS_REQUESTED',
    CreateConsignmentsSucceeded = 'CREATE_CONSIGNMENTS_SUCCEEDED',
    CreateConsignmentsFailed = 'CREATE_CONSIGNMENTS_FAILED',

    UpdateConsignmentRequested = 'UPDATE_CONSIGNMENT_REQUESTED',
    UpdateConsignmentSucceeded = 'UPDATE_CONSIGNMENT_SUCCEEDED',
    UpdateConsignmentFailed = 'UPDATE_CONSIGNMENT_FAILED',
}

export type ConsignmentAction =
    CreateConsignmentsAction |
    UpdateConsignmentAction;

export type CreateConsignmentsAction =
    CreateConsignmentsRequestedAction |
    CreateConsignmentsSucceededAction |
    CreateConsignmentsFailedAction;

export type UpdateConsignmentAction =
    UpdateConsignmentRequestedAction |
    UpdateConsignmentSucceededAction |
    UpdateConsignmentFailedAction;

export interface CreateConsignmentsRequestedAction extends Action {
    type: ConsignmentActionType.CreateConsignmentsRequested;
}

export interface CreateConsignmentsSucceededAction extends Action<Checkout> {
    type: ConsignmentActionType.CreateConsignmentsSucceeded;
}

export interface CreateConsignmentsFailedAction extends Action<Error> {
    type: ConsignmentActionType.CreateConsignmentsFailed;
}

export interface UpdateConsignmentRequestedAction extends Action {
    type: ConsignmentActionType.UpdateConsignmentRequested;
}

export interface UpdateConsignmentSucceededAction extends Action<Checkout> {
    type: ConsignmentActionType.UpdateConsignmentSucceeded;
}

export interface UpdateConsignmentFailedAction extends Action<Error> {
    type: ConsignmentActionType.UpdateConsignmentFailed;
}
