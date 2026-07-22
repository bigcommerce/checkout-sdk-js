import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import CheckoutStore from '../checkout/checkout-store';
import { RequestOptions } from '../common/http-request';
import { CountryRequestSender } from '../geography';

import { LoadShippingCountriesAction, ShippingCountryActionType } from './shipping-country-actions';
import ShippingCountryRequestSender from './shipping-country-request-sender';

export default class ShippingCountryActionCreator {
    constructor(
        private _shippingCountryRequestSender: ShippingCountryRequestSender,
        private _store: CheckoutStore,
        private _countryRequestSender: CountryRequestSender,
    ) {}

    loadCountries(options?: RequestOptions): Observable<LoadShippingCountriesAction> {
        const { checkout } = this._store.getState();
        const checkoutData = checkout.getCheckout();

        const channelId = checkoutData ? checkoutData.channelId : null;

        return Observable.create((observer: Observer<LoadShippingCountriesAction>) => {
            observer.next(createAction(ShippingCountryActionType.LoadShippingCountriesRequested));

            this._shippingCountryRequestSender
                .loadCountries(channelId, options)
                .then((response) => {
                    observer.next(
                        createAction(
                            ShippingCountryActionType.LoadShippingCountriesSucceeded,
                            response.body.data,
                        ),
                    );
                    observer.complete();
                })
                .catch((response) => {
                    if (response && response.status >= 500) {
                        return this._countryRequestSender
                            .loadCountries(options)
                            .then((fallbackResponse) => {
                                observer.next(
                                    createAction(
                                        ShippingCountryActionType.LoadShippingCountriesSucceeded,
                                        fallbackResponse.body.data,
                                    ),
                                );
                                observer.complete();
                            })
                            .catch(() => {
                                observer.error(
                                    createErrorAction(
                                        ShippingCountryActionType.LoadShippingCountriesFailed,
                                        response,
                                    ),
                                );
                            });
                    }

                    observer.error(
                        createErrorAction(
                            ShippingCountryActionType.LoadShippingCountriesFailed,
                            response,
                        ),
                    );
                });
        });
    }
}
