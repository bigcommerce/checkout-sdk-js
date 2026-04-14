export interface B2BToken {
    token: string;
}

export default interface B2BTokenState {
    data?: B2BToken;
    errors: B2BTokenErrorsState;
    statuses: B2BTokenStatusesState;
}

export interface B2BTokenErrorsState {
    loadError?: Error;
}

export interface B2BTokenStatusesState {
    isLoading?: boolean;
}

export const DEFAULT_STATE: B2BTokenState = {
    errors: {},
    statuses: {},
};
