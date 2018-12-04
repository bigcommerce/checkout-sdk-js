import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import { getCountries } from './countries.mock';
import CountryActionCreator from './country-action-creator';
import { CountryActionType } from './country-actions';
import CountryRequestSender from './country-request-sender';

describe('CountryActionCreator', () => {
    let countryRequestSender: CountryRequestSender;
    let countryActionCreator: CountryActionCreator;
    let errorResponse: Response;
    let response: Response;

    beforeEach(() => {
        response = getResponse({ data: getCountries() });
        errorResponse = getErrorResponse();

        countryRequestSender = new CountryRequestSender(createRequestSender(), { locale: '' });
        countryActionCreator = new CountryActionCreator(countryRequestSender);

        jest.spyOn(countryRequestSender, 'loadCountries').mockReturnValue(Promise.resolve(response));
    });

    describe('#loadCountries()', () => {
        it('emits actions if able to load countries', () => {
            countryActionCreator.loadCountries()
                .pipe(toArray())
                .subscribe(actions => {
                    expect(actions).toEqual([
                        { type: CountryActionType.LoadCountriesRequested },
                        { type: CountryActionType.LoadCountriesSucceeded, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to load countries', () => {
            jest.spyOn(countryRequestSender, 'loadCountries').mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));

            countryActionCreator.loadCountries()
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .subscribe(actions => {
                    expect(actions).toEqual([
                        { type: CountryActionType.LoadCountriesRequested },
                        { type: CountryActionType.LoadCountriesFailed, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
