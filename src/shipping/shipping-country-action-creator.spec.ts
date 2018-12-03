import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { ErrorResponseBody } from '../common/error';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { getCountries } from '../geography/countries.mock';

import ShippingCountryActionCreator from './shipping-country-action-creator';
import { ShippingCountryActionType } from './shipping-country-actions';
import ShippingCountryRequestSender from './shipping-country-request-sender';

describe('ShippingCountryActionCreator', () => {
    let requestSender: ShippingCountryRequestSender;
    let shippingCountryActionCreator: ShippingCountryActionCreator;
    let errorResponse: Response<ErrorResponseBody>;
    let response: Response;

    beforeEach(() => {
        response = getResponse({ data: getCountries() });
        errorResponse = getErrorResponse();

        requestSender = new ShippingCountryRequestSender(createRequestSender(), {});

        jest.spyOn(requestSender, 'loadCountries').mockReturnValue(Promise.resolve(response));

        shippingCountryActionCreator = new ShippingCountryActionCreator(requestSender);
    });

    describe('#loadCountries()', () => {
        it('emits actions if able to load countries', () => {
            shippingCountryActionCreator.loadCountries()
                .pipe(toArray())
                .subscribe(actions => {
                    expect(actions).toEqual([
                        { type: ShippingCountryActionType.LoadShippingCountriesRequested },
                        { type: ShippingCountryActionType.LoadShippingCountriesSucceeded, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to load countries', () => {
            jest.spyOn(requestSender, 'loadCountries').mockReturnValue(Promise.reject(errorResponse));

            const errorHandler = jest.fn(action => of(action));

            shippingCountryActionCreator.loadCountries()
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .subscribe(actions => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: ShippingCountryActionType.LoadShippingCountriesRequested },
                        { type: ShippingCountryActionType.LoadShippingCountriesFailed, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
