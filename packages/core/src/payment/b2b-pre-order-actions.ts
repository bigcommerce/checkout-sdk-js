import { Action } from '@bigcommerce/data-store';

export enum B2BPreOrderActionType {
    PreOrderB2BMetadataRequested = 'PRE_ORDER_B2B_METADATA_REQUESTED',
    PreOrderB2BMetadataSucceeded = 'PRE_ORDER_B2B_METADATA_SUCCEEDED',
    PreOrderB2BMetadataFailed = 'PRE_ORDER_B2B_METADATA_FAILED',
}

export type PreOrderB2BMetadataAction =
    | PreOrderB2BMetadataRequestedAction
    | PreOrderB2BMetadataSucceededAction
    | PreOrderB2BMetadataFailedAction;

export interface PreOrderB2BMetadataRequestedAction extends Action {
    type: B2BPreOrderActionType.PreOrderB2BMetadataRequested;
}

export interface PreOrderB2BMetadataSucceededAction extends Action {
    type: B2BPreOrderActionType.PreOrderB2BMetadataSucceeded;
}

export interface PreOrderB2BMetadataFailedAction extends Action<Error> {
    type: B2BPreOrderActionType.PreOrderB2BMetadataFailed;
}
