import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import CheckoutStore from '../checkout/checkout-store';
import { RequestOptions } from '../common/http-request';

import { LoadShippingCountriesAction, ShippingCountryActionType } from './shipping-country-actions';
import ShippingCountryRequestSender from './shipping-country-request-sender';

export default class ShippingCountryActionCreator {
    constructor(
        private _shippingCountryRequestSender: ShippingCountryRequestSender,
        private _store: CheckoutStore,
    ) {}
    loadCountries(
        options?: RequestOptions<{ channelId?: number }>,
    ): Observable<LoadShippingCountriesAction> {
        const channelId = this.getChannelId(options?.params?.channelId);

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
                    observer.error(
                        createErrorAction(
                            ShippingCountryActionType.LoadShippingCountriesFailed,
                            response,
                        ),
                    );
                });
        });
    }

    private getChannelId(channelIdParam?: number): number {
        if (channelIdParam) {
            return channelIdParam;
        }

        const { checkout } = this._store.getState();
        const data = checkout.getCheckoutOrThrow();

        return data.channelId;
    }
}
