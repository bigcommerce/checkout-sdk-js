import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { ErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import createCheckoutStore from '../checkout/create-checkout-store';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { CountryRequestSender } from '../geography';
import { getAustralia, getCountries } from '../geography/countries.mock';

import ShippingCountryActionCreator from './shipping-country-action-creator';
import { ShippingCountryActionType } from './shipping-country-actions';
import ShippingCountryRequestSender from './shipping-country-request-sender';

describe('ShippingCountryActionCreator', () => {
    let requestSender: ShippingCountryRequestSender;
    let countryRequestSender: CountryRequestSender;
    let shippingCountryActionCreator: ShippingCountryActionCreator;
    let errorResponse: Response<ErrorResponseBody>;
    let response: Response<any>;
    let fallbackResponse: Response<any>;
    let store: CheckoutStore;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        response = getResponse({ data: getCountries() });
        fallbackResponse = getResponse({ data: [getAustralia()] });
        errorResponse = getErrorResponse();

        requestSender = new ShippingCountryRequestSender(createRequestSender(), {});
        countryRequestSender = new CountryRequestSender(createRequestSender(), {});

        jest.spyOn(requestSender, 'loadCountries').mockReturnValue(Promise.resolve(response));
        jest.spyOn(countryRequestSender, 'loadCountries').mockReturnValue(
            Promise.resolve(fallbackResponse),
        );

        shippingCountryActionCreator = new ShippingCountryActionCreator(
            requestSender,
            store,
            countryRequestSender,
        );
    });

    describe('#loadCountries()', () => {
        it('emits actions if able to load countries', () => {
            shippingCountryActionCreator
                .loadCountries()
                .pipe(toArray())
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: ShippingCountryActionType.LoadShippingCountriesRequested },
                        {
                            type: ShippingCountryActionType.LoadShippingCountriesSucceeded,
                            payload: response.body.data,
                        },
                    ]);
                });
        });

        it('emits error actions if unable to load countries with a non-5xx error', () => {
            jest.spyOn(requestSender, 'loadCountries').mockReturnValue(
                Promise.reject(errorResponse),
            );

            const errorHandler = jest.fn((action) => of(action));

            shippingCountryActionCreator
                .loadCountries()
                .pipe(catchError(errorHandler), toArray())
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(countryRequestSender.loadCountries).not.toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: ShippingCountryActionType.LoadShippingCountriesRequested },
                        {
                            type: ShippingCountryActionType.LoadShippingCountriesFailed,
                            payload: errorResponse,
                            error: true,
                        },
                    ]);
                });
        });

        it('does not fall back to /store/countries on a timeout response', () => {
            const timeoutResponse = getErrorResponse(undefined, undefined, 0, '');

            jest.spyOn(requestSender, 'loadCountries').mockReturnValue(
                Promise.reject(timeoutResponse),
            );

            const errorHandler = jest.fn((action) => of(action));

            shippingCountryActionCreator
                .loadCountries()
                .pipe(catchError(errorHandler), toArray())
                .subscribe(() => {
                    expect(countryRequestSender.loadCountries).not.toHaveBeenCalled();
                });
        });

        describe('when the shipping countries request fails with a 5xx error', () => {
            let serverErrorResponse: Response<ErrorResponseBody>;

            beforeEach(() => {
                serverErrorResponse = getErrorResponse(
                    undefined,
                    undefined,
                    500,
                    'Internal Server Error',
                );

                jest.spyOn(requestSender, 'loadCountries').mockReturnValue(
                    Promise.reject(serverErrorResponse),
                );
            });

            it('falls back to /store/countries and emits success with its data', () => {
                shippingCountryActionCreator
                    .loadCountries()
                    .pipe(toArray())
                    .subscribe((actions) => {
                        expect(actions).toEqual([
                            { type: ShippingCountryActionType.LoadShippingCountriesRequested },
                            {
                                type: ShippingCountryActionType.LoadShippingCountriesSucceeded,
                                payload: fallbackResponse.body.data,
                            },
                        ]);
                    });
            });

            it('calls the fallback without a channelId, passing through the given options', () => {
                const options = { timeout: undefined };

                shippingCountryActionCreator
                    .loadCountries(options)
                    .pipe(toArray())
                    .subscribe(() => {
                        expect(countryRequestSender.loadCountries).toHaveBeenCalledWith(options);
                    });
            });

            it('emits the original error if the fallback also fails', () => {
                jest.spyOn(countryRequestSender, 'loadCountries').mockReturnValue(
                    Promise.reject(getErrorResponse()),
                );

                const errorHandler = jest.fn((action) => of(action));

                shippingCountryActionCreator
                    .loadCountries()
                    .pipe(catchError(errorHandler), toArray())
                    .subscribe((actions) => {
                        expect(errorHandler).toHaveBeenCalled();
                        expect(actions).toEqual([
                            { type: ShippingCountryActionType.LoadShippingCountriesRequested },
                            {
                                type: ShippingCountryActionType.LoadShippingCountriesFailed,
                                payload: serverErrorResponse,
                                error: true,
                            },
                        ]);
                    });
            });
        });

        describe('when checkout is undefined', () => {
            beforeEach(() => {
                store = createCheckoutStore({ checkout: undefined });
                shippingCountryActionCreator = new ShippingCountryActionCreator(
                    requestSender,
                    store,
                    countryRequestSender,
                );
            });

            it('passes null as channelId when checkout is undefined', () => {
                const loadCountriesSpy = jest.spyOn(requestSender, 'loadCountries');

                shippingCountryActionCreator.loadCountries().subscribe();

                expect(loadCountriesSpy).toHaveBeenCalledWith(null, undefined);
            });
        });
    });
});
