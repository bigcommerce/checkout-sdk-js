import { Action } from '@bigcommerce/data-store';

import { B2BPostOrderData } from './b2b-post-order-state';

export interface PersistB2BMetadataOptions {
    isInvoice: boolean;
    invoiceComment: string;
}

export enum B2BPostOrderActionType {
    PersistB2BMetadataRequested = 'PERSIST_B2B_METADATA_REQUESTED',
    PersistB2BMetadataSucceeded = 'PERSIST_B2B_METADATA_SUCCEEDED',
    PersistB2BMetadataFailed = 'PERSIST_B2B_METADATA_FAILED',
}

export type PersistB2BMetadataAction =
    | PersistB2BMetadataRequestedAction
    | PersistB2BMetadataSucceededAction
    | PersistB2BMetadataFailedAction;

export interface PersistB2BMetadataRequestedAction extends Action {
    type: B2BPostOrderActionType.PersistB2BMetadataRequested;
}

export interface PersistB2BMetadataSucceededAction extends Action<B2BPostOrderData> {
    type: B2BPostOrderActionType.PersistB2BMetadataSucceeded;
}

export interface PersistB2BMetadataFailedAction extends Action<Error> {
    type: B2BPostOrderActionType.PersistB2BMetadataFailed;
}
