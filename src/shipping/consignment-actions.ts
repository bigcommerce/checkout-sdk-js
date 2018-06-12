import { Action } from '@bigcommerce/data-store';

export enum ConsignmentActionTypes {
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
    type: ConsignmentActionTypes.CreateConsignmentsRequested;
}

export interface CreateConsignmentsSucceededAction extends Action {
    type: ConsignmentActionTypes.CreateConsignmentsSucceeded;
}

export interface CreateConsignmentsFailedAction extends Action<Error> {
    type: ConsignmentActionTypes.CreateConsignmentsFailed;
}

export interface UpdateConsignmentRequestedAction extends Action {
    type: ConsignmentActionTypes.UpdateConsignmentRequested;
}

export interface UpdateConsignmentSucceededAction extends Action {
    type: ConsignmentActionTypes.UpdateConsignmentSucceeded;
}

export interface UpdateConsignmentFailedAction extends Action<Error> {
    type: ConsignmentActionTypes.UpdateConsignmentFailed;
}
