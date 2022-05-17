import { Action } from '@bigcommerce/data-store';

import { Country } from '../geography';

export enum ShippingCountryActionType {
    LoadShippingCountriesRequested = 'LOAD_SHIPPING_COUNTRIES_REQUESTED',
    LoadShippingCountriesSucceeded = 'LOAD_SHIPPING_COUNTRIES_SUCCEEDED',
    LoadShippingCountriesFailed = 'LOAD_SHIPPING_COUNTRIES_FAILED',
}

export type LoadShippingCountriesAction = LoadShippingCountriesRequestedAction |
    LoadShippingCountriesSucceededAction |
    LoadShippingCountriesFailedAction;

export interface LoadShippingCountriesRequestedAction extends Action {
    type: ShippingCountryActionType.LoadShippingCountriesRequested;
}

export interface LoadShippingCountriesSucceededAction extends Action<Country[]> {
    type: ShippingCountryActionType.LoadShippingCountriesSucceeded;
}

export interface LoadShippingCountriesFailedAction extends Action<Error> {
    type: ShippingCountryActionType.LoadShippingCountriesFailed;
}
