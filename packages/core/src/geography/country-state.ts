import Country from './country';

export default interface CountryState {
    data?: Country[];
    errors: CountryErrorsState;
    statuses: CountryStatusesState;
}

export interface CountryErrorsState {
    loadError?: Error;
}

export interface CountryStatusesState {
    isLoading?: boolean;
}

export const DEFAULT_STATE: CountryState = {
    errors: {},
    statuses: {},
};
