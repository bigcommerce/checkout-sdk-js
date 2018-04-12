import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { InternalAddress } from '../address';
import { CheckoutClient } from '../checkout';
import { RequestOptions } from '../common/http-request';

import * as actionTypes from './shipping-address-action-types';

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Action<T>
 */
export default class ShippingAddressActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    updateAddress(address: InternalAddress, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.UPDATE_SHIPPING_ADDRESS_REQUESTED));

            this._checkoutClient.updateShippingAddress(address, options)
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED, body.data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.UPDATE_SHIPPING_ADDRESS_FAILED, response));
                });
        });
    }
}
