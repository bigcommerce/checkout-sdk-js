import { Action } from '@bigcommerce/data-store';

export enum ConsignmentActionTypes {
    CreateConsignmentsRequested = 'CREATE_CONSIGNMENTS_REQUESTED',
    CreateConsignmentsSucceeded = 'CREATE_CONSIGNMENTS_SUCCEEDED',
    CreateConsignmentsFailed = 'CREATE_CONSIGNMENTS_FAILED',
}
export type CreateConsignmentsAction =
    CreateConsignmentsRequestedAction |
    CreateConsignmentsSucceededAction |
    CreateConsignmentsFailedAction;

export interface CreateConsignmentsRequestedAction extends Action {
    type: ConsignmentActionTypes.CreateConsignmentsRequested;
}

export interface CreateConsignmentsSucceededAction extends Action {
    type: ConsignmentActionTypes.CreateConsignmentsSucceeded;
}

export interface CreateConsignmentsFailedAction extends Action<Error> {
    type: ConsignmentActionTypes.CreateConsignmentsFailed;
}
