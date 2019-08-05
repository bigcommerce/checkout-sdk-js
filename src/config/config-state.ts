import Config from './config';

export default interface ConfigState {
    data?: Config;
    meta?: ConfigMetaState;
    errors: ConfigErrorsState;
    statuses: ConfigStatusesState;
}

export interface ConfigMetaState {
    externalSource?: string;
}

export interface ConfigErrorsState {
    loadError?: Error;
}

export interface ConfigStatusesState {
    isLoading?: boolean;
}

export const DEFAULT_STATE: ConfigState = {
    meta: {},
    errors: {},
    statuses: {},
};
