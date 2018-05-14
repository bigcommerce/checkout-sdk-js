import { Action } from '@bigcommerce/data-store';

import Config from './config';

export enum ConfigActionType {
    LoadConfigRequested = 'LOAD_CONFIG_REQUESTED',
    LoadConfigSucceeded = 'LOAD_CONFIG_SUCCEEDED',
    LoadConfigFailed = 'LOAD_CONFIG_FAILED',
}

export type LoadConfigAction =
    LoadConfigRequestedAction |
    LoadConfigSucceededAction |
    LoadConfigFailedAction;

export interface LoadConfigRequestedAction extends Action {
    type: ConfigActionType.LoadConfigRequested;
}

export interface LoadConfigSucceededAction extends Action<Config> {
    type: ConfigActionType.LoadConfigSucceeded;
}

export interface LoadConfigFailedAction extends Action<Error> {
    type: ConfigActionType.LoadConfigFailed;
}
