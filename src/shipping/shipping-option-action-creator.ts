import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient } from '../checkout';
import { RequestOptions } from '../common/http-request';

import * as actionTypes from './shipping-option-action-types';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class ShippingOptionActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    loadShippingOptions(options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED));

            this._checkoutClient.loadShippingOptions(options)
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED, body.data));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.LOAD_SHIPPING_OPTIONS_FAILED, response));
                });
        });
    }

    selectShippingOption(addressId: string, shippingOptionId: string, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.SELECT_SHIPPING_OPTION_REQUESTED));

            this._checkoutClient.selectShippingOption(addressId, shippingOptionId, options)
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED, body.data));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.SELECT_SHIPPING_OPTION_FAILED, response));
                });
        });
    }
}
