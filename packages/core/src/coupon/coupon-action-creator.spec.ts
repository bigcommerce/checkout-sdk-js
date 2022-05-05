import { createRequestSender, Response } from '@bigcommerce/request-sender';
import { from, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';

import { createCheckoutStore, Checkout, CheckoutStore, CheckoutStoreState } from '../checkout';
import { getCheckoutStoreState, getCheckoutWithCoupons } from '../checkout/checkouts.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';

import CouponActionCreator from './coupon-action-creator';
import { CouponActionType } from './coupon-actions';
import CouponRequestSender from './coupon-request-sender';

describe('CouponActionCreator', () => {
    let couponActionCreator: CouponActionCreator;
    let errorResponse: Response<Error>;
    let response: Response<Checkout>;
    let state: CheckoutStoreState;
    let store: CheckoutStore;
    let requestSender: CouponRequestSender;

    beforeEach(() => {
        response = getResponse(getCheckoutWithCoupons());
        errorResponse = getErrorResponse();
        state = getCheckoutStoreState();
        store = createCheckoutStore(state);
        requestSender = new CouponRequestSender(createRequestSender());

        couponActionCreator = new CouponActionCreator(requestSender);

        jest.spyOn(requestSender, 'applyCoupon').mockReturnValue(Promise.resolve(response));
        jest.spyOn(requestSender, 'removeCoupon').mockReturnValue(Promise.resolve(response));
    });

    describe('#applyCoupon()', () => {
        beforeEach(() => {
            jest.spyOn(store, 'dispatch');
        });

        it('emits actions if able to apply coupon', () => {
            const coupon = 'myCouponCode1234';

            from(couponActionCreator.applyCoupon(coupon)(store))
                .pipe(toArray())
                .subscribe(actions => {
                    expect(actions).toEqual([
                        { type: CouponActionType.ApplyCouponRequested },
                        { type: CouponActionType.ApplyCouponSucceeded, payload: getCheckoutWithCoupons() },
                    ]);
                });
        });

        it('emits error actions if unable to apply coupon', () => {
            jest.spyOn(requestSender, 'applyCoupon').mockReturnValue(Promise.reject(errorResponse));

            const coupon = 'myCouponCode1234';
            const errorHandler = jest.fn(action => of(action));

            from(couponActionCreator.applyCoupon(coupon)(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .subscribe(actions => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: CouponActionType.ApplyCouponRequested },
                        { type: CouponActionType.ApplyCouponFailed, payload: errorResponse, error: true },
                    ]);
                });
        });
    });

    describe('#removeCoupon()', () => {
        beforeEach(() => {
            jest.spyOn(store, 'dispatch');
        });

        it('emits actions if able to remove coupon', () => {
            const coupon = 'myCouponCode1234';

            from(couponActionCreator.removeCoupon(coupon)(store))
                .pipe(toArray())
                .subscribe(actions => {
                    expect(actions).toEqual([
                        { type: CouponActionType.RemoveCouponRequested },
                        { type: CouponActionType.RemoveCouponSucceeded, payload: getCheckoutWithCoupons() },
                    ]);
                });
        });

        it('emits error actions if unable to remove coupon', () => {
            jest.spyOn(requestSender, 'removeCoupon').mockReturnValue(Promise.reject(errorResponse));

            const coupon = 'myCouponCode1234';
            const errorHandler = jest.fn(action => of(action));

            from(couponActionCreator.removeCoupon(coupon)(store))
                .pipe(
                    catchError(errorHandler),
                    toArray()
                )
                .subscribe(actions => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: CouponActionType.RemoveCouponRequested },
                        { type: CouponActionType.RemoveCouponFailed, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
