import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '../../data-store';
import * as actionTypes from './shipping-option-action-types.js';

export default class ShippingOptionActionCreator {
    /**
     * @constructor
     * @param {CheckoutClient} checkoutClient
     */
    constructor(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    loadShippingOptions(options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED));

            this._checkoutClient.loadShippingOptions(options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_SHIPPING_OPTIONS_FAILED, response));
                });
        });
    }

    /**
     * @param {string} addressId
     * @param {string} shippingOptionId
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    selectShippingOption(addressId, shippingOptionId, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.SELECT_SHIPPING_OPTION_REQUESTED));

            this._checkoutClient.selectShippingOption(addressId, shippingOptionId, options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.SELECT_SHIPPING_OPTION_FAILED, response));
                });
        });
    }
}
