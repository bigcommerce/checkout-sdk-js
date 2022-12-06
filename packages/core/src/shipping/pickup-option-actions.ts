import { Action } from '@bigcommerce/data-store';

import { PickupOptionMeta, PickupOptionResult } from './pickup-option';

export enum PickupOptionActionType {
    LoadPickupOptionsRequested = 'LOAD_PICKUP_OPTIONS_REQUESTED',
    LoadPickupOptionsSucceeded = 'LOAD_PICKUP_OPTIONS_SUCCEEDED',
    LoadPickupOptionsFailed = 'LOAD_PICKUP_OPTIONS_FAILED',
}

export type LoadPickupOptionsAction =
    | PickupOptionRequestedAction
    | LoadPickupOptionsSucceededAction
    | LoadPickupOptionsFailedAction;

export interface PickupOptionRequestedAction extends Action {
    type: PickupOptionActionType.LoadPickupOptionsRequested;
}

export interface LoadPickupOptionsSucceededAction
    extends Action<PickupOptionResult[], PickupOptionMeta> {
    type: PickupOptionActionType.LoadPickupOptionsSucceeded;
}

export interface LoadPickupOptionsFailedAction extends Action<Error> {
    type: PickupOptionActionType.LoadPickupOptionsFailed;
}
