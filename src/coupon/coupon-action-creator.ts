import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { InternalCheckoutSelectors } from '../checkout';
import { MissingDataError } from '../common/error/errors';
import { RequestOptions } from '../common/http-request';

import { ApplyCouponAction, CouponAction, CouponActionType, RemoveCouponAction } from './coupon-actions';
import CouponRequestSender from './coupon-request-sender';

export default class CouponActionCreator {
    constructor(
        private _couponRequestSender: CouponRequestSender
    ) {}

    applyCoupon(code: string, options?: RequestOptions): ThunkAction<CouponAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<ApplyCouponAction>) => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError('Unable to apply coupon because "checkout" data is missing.');
            }

            observer.next(createAction(CouponActionType.ApplyCouponRequested));

            this._couponRequestSender.applyCoupon(checkout.id, code, options)
                .then(({ body }) => {
                    observer.next(createAction(CouponActionType.ApplyCouponSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(CouponActionType.ApplyCouponFailed, response));
                });
        });
    }

    removeCoupon(code: string, options?: RequestOptions): ThunkAction<CouponAction, InternalCheckoutSelectors> {
        return store => Observable.create((observer: Observer<RemoveCouponAction>) => {
            const state = store.getState();
            const checkout = state.checkout.getCheckout();

            if (!checkout) {
                throw new MissingDataError('Unable to remove coupon because "checkout" data is missing.');
            }

            observer.next(createAction(CouponActionType.RemoveCouponRequested));

            this._couponRequestSender.removeCoupon(checkout.id, code, options)
                .then(({ body }) => {
                    observer.next(createAction(CouponActionType.RemoveCouponSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(CouponActionType.RemoveCouponFailed, response));
                });
        });
    }
}
