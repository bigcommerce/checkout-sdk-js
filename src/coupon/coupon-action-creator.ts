import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient } from '../checkout';
import { RequestOptions } from '../common/http-request';

import * as actionTypes from './coupon-action-types';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class CouponActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    applyCoupon(checkoutId: string, code: string, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.APPLY_COUPON_REQUESTED));

            this._checkoutClient.applyCoupon(checkoutId, code, options)
                .then(({ body }) => {
                    observer.next(createAction(actionTypes.APPLY_COUPON_SUCCEEDED, body));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.APPLY_COUPON_FAILED, response));
                });
        });
    }

    removeCoupon(checkoutId: string, code: string, options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.REMOVE_COUPON_REQUESTED));

            this._checkoutClient.removeCoupon(checkoutId, code, options)
                .then(({ body }) => {
                    observer.next(createAction(actionTypes.REMOVE_COUPON_SUCCEEDED, body));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.REMOVE_COUPON_FAILED, response));
                });
        });
    }
}
