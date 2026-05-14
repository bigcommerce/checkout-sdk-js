export interface PoConfig {
    enabled: boolean;
    label: string;
    required: boolean;
}

export default interface PoConfigState {
    data?: PoConfig;
    errors: PoConfigErrorsState;
    statuses: PoConfigStatusesState;
}

export interface PoConfigErrorsState {
    loadError?: Error;
}

export interface PoConfigStatusesState {
    isLoading?: boolean;
}

export const DEFAULT_STATE: PoConfigState = {
    errors: {},
    statuses: {},
};
