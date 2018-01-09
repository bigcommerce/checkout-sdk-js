import { Observable } from 'rxjs';
import { getCountries } from './countries.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import * as actionTypes from './country-action-types';
import CountryActionCreator from './country-action-creator';

describe('CountryActionCreator', () => {
    let checkoutClient;
    let countryActionCreator;
    let errorResponse;
    let response;

    beforeEach(() => {
        response = getResponse({ data: getCountries() });
        errorResponse = getErrorResponse();

        checkoutClient = {
            loadCountries: jest.fn(() => Promise.resolve(response)),
        };

        countryActionCreator = new CountryActionCreator(checkoutClient);
    });

    describe('#loadCountries()', () => {
        it('emits actions if able to load countries', () => {
            countryActionCreator.loadCountries()
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_COUNTRIES_REQUESTED },
                        { type: actionTypes.LOAD_COUNTRIES_SUCCEEDED, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to load countries', () => {
            checkoutClient.loadCountries.mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            countryActionCreator.loadCountries()
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_COUNTRIES_REQUESTED },
                        { type: actionTypes.LOAD_COUNTRIES_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
