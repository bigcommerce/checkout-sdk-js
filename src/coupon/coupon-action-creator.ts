import { createAction, createErrorAction, Action, ThunkAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient, InternalCheckoutSelectors } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import * as actionTypes from './coupon-action-types';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class CouponActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    applyCoupon(code: string, options?: RequestOptions): ThunkAction<Action, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<Action>) => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError('Unable to apply coupon because "checkout" data is missing.');
            }

            observer.next(createAction(actionTypes.APPLY_COUPON_REQUESTED));

            this._checkoutClient.applyCoupon(checkout.id, code, options)
                .then(({ body }) => {
                    observer.next(createAction(actionTypes.APPLY_COUPON_SUCCEEDED, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.APPLY_COUPON_FAILED, response));
                });
        });
    }

    removeCoupon(code: string, options?: RequestOptions): ThunkAction<Action, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<Action>) => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError('Unable to remove coupon because "checkout" data is missing.');
            }

            observer.next(createAction(actionTypes.REMOVE_COUPON_REQUESTED));

            this._checkoutClient.removeCoupon(checkout.id, code, options)
                .then(({ body }) => {
                    observer.next(createAction(actionTypes.REMOVE_COUPON_SUCCEEDED, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.REMOVE_COUPON_FAILED, response));
                });
        });
    }
}
