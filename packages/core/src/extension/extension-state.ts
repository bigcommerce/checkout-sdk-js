import { Extension } from './extension';

export interface ExtensionState {
    data?: Extension[];
    errors: ExtensionErrorsState;
    statuses: ExtensionStatusesState;
}

export interface ExtensionErrorsState {
    loadError?: Error;
    renderError?: Error;
}

export interface ExtensionStatusesState {
    isLoading?: boolean;
}

export const DEFAULT_STATE: ExtensionState = {
    errors: {},
    statuses: {},
};
