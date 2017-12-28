import { Observable } from 'rxjs';
import { getCountries } from '../geography/countries.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getErrorResponseBody } from '../common/error/errors.mock';
import * as actionTypes from './shipping-country-action-types';
import ShippingCountryActionCreator from './shipping-country-action-creator';

describe('ShippingCountryActionCreator', () => {
    let checkoutClient;
    let shippingCountryActionCreator;
    let errorResponse;
    let response;

    beforeEach(() => {
        response = getResponse({ data: getCountries() });
        errorResponse = getErrorResponse(getErrorResponseBody());

        checkoutClient = {
            loadShippingCountries: jest.fn(() => Promise.resolve(response)),
        };

        shippingCountryActionCreator = new ShippingCountryActionCreator(checkoutClient);
    });

    describe('#loadCountries()', () => {
        it('emits actions if able to load countries', () => {
            shippingCountryActionCreator.loadCountries()
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED },
                        { type: actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to load countries', () => {
            checkoutClient.loadShippingCountries.mockImplementation(() => Promise.reject(errorResponse));

            const errorHandler = jest.fn((action) => Observable.of(action));

            shippingCountryActionCreator.loadCountries()
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED },
                        { type: actionTypes.LOAD_SHIPPING_COUNTRIES_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
