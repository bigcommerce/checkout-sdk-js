import { Action } from '@bigcommerce/data-store';

import { PoConfig } from './po-config-state';

export enum PoConfigActionType {
    LoadPoConfigRequested = 'LOAD_PO_CONFIG_REQUESTED',
    LoadPoConfigSucceeded = 'LOAD_PO_CONFIG_SUCCEEDED',
    LoadPoConfigFailed = 'LOAD_PO_CONFIG_FAILED',
}

export type LoadPoConfigAction =
    | LoadPoConfigRequestedAction
    | LoadPoConfigSucceededAction
    | LoadPoConfigFailedAction;

export interface LoadPoConfigRequestedAction extends Action {
    type: PoConfigActionType.LoadPoConfigRequested;
}

export interface LoadPoConfigSucceededAction extends Action<PoConfig> {
    type: PoConfigActionType.LoadPoConfigSucceeded;
}

export interface LoadPoConfigFailedAction extends Action<Error> {
    type: PoConfigActionType.LoadPoConfigFailed;
}
