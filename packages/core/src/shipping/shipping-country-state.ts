import { Country } from '../geography';

export default interface ShippingCountryState {
    data?: Country[];
    errors: ShippingCountryErrorsState;
    statuses: ShippingCountryStatusesState;
}

export interface ShippingCountryErrorsState {
    loadError?: Error;
}

export interface ShippingCountryStatusesState {
    isLoading?: boolean;
}

export const DEFAULT_STATE: ShippingCountryState = {
    errors: {},
    statuses: {},
};
