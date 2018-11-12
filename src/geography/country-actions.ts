import { Action } from '@bigcommerce/data-store';

import Country from './country';

export enum CountryActionType {
    LoadCountriesRequested = 'LOAD_COUNTRIES_REQUESTED',
    LoadCountriesSucceeded = 'LOAD_COUNTRIES_SUCCEEDED',
    LoadCountriesFailed = 'LOAD_COUNTRIES_FAILED',
}

export type LoadCountriesAction =
    LoadCountriesRequestedAction |
    LoadCountriesSucceededAction |
    LoadCountriesFailedAction;

export interface LoadCountriesRequestedAction extends Action {
    type: CountryActionType.LoadCountriesRequested;
}

export interface LoadCountriesSucceededAction extends Action<Country[]> {
    type: CountryActionType.LoadCountriesSucceeded;
}

export interface LoadCountriesFailedAction extends Action<Error> {
    type: CountryActionType.LoadCountriesFailed;
}
