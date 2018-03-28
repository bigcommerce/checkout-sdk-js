import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '@bigcommerce/data-store';
import * as actionTypes from './coupon-action-types';

export default class CouponActionCreator {
    /**
     * @constructor
     * @param {CheckoutClient} checkoutClient
     */
    constructor(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }

    /**
     * @param {string} checkoutId
     * @param {string} code
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    applyCoupon(checkoutId, code, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.APPLY_COUPON_REQUESTED));

            this._checkoutClient.applyCoupon(checkoutId, code, options)
                .then(({ body } = {}) => {
                    observer.next(createAction(actionTypes.APPLY_COUPON_SUCCEEDED, body));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.APPLY_COUPON_FAILED, response));
                });
        });
    }

    /**
     * @param {string} checkoutId
     * @param {string} code
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    removeCoupon(checkoutId, code, options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.REMOVE_COUPON_REQUESTED));

            this._checkoutClient.removeCoupon(checkoutId, code, options)
                .then(({ body } = {}) => {
                    observer.next(createAction(actionTypes.REMOVE_COUPON_SUCCEEDED, body));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.REMOVE_COUPON_FAILED, response));
                });
        });
    }
}
