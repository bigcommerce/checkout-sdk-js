import { Action } from '@bigcommerce/data-store';

import { PickupOption } from './pickup-option';

export enum PickupOptionActionType {
    LoadPickupOptionsRequested = 'LOAD_PICKUP_OPTIONS_REQUESTED',
    LoadPickupOptionSucceeded = 'LOAD_PICKUP_OPTIONS_SUCCEEDED',
    LoadPickupOptionsFailed = 'LOAD_PICKUP_OPTIONS_FAILED',
}

export type LoadPickupOptionsAction =
    PickupOptionRequestedAction |
    LoadPickupOptionsSucceededAction |
    LoadPickupOptionsFailedAction;

export interface PickupOptionRequestedAction extends Action {
    type: PickupOptionActionType.LoadPickupOptionsRequested;
}

export interface LoadPickupOptionsSucceededAction extends Action<PickupOption[]> {
    type: PickupOptionActionType.LoadPickupOptionSucceeded;
}

export interface LoadPickupOptionsFailedAction extends Action<Error> {
    type: PickupOptionActionType.LoadPickupOptionsFailed;
}
