import Config from './config';

export default interface ConfigState {
    data?: Config;
    errors: ConfigErrorsState;
    statuses: ConfigStatusesState;
}

export interface ConfigErrorsState {
    loadError?: Error;
}

export interface ConfigStatusesState {
    isLoading?: boolean;
}
