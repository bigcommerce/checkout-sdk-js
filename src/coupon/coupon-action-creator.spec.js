import { Observable } from 'rxjs';
import { createCheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { getCouponResponseBody } from './internal-coupons.mock';
import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import CouponActionCreator from './coupon-action-creator';
import { CouponActionType } from './coupon-actions';

describe('CouponActionCreator', () => {
    let checkoutClient;
    let couponActionCreator;
    let errorResponse;
    let response;
    let state;
    let store;

    beforeEach(() => {
        response = getResponse(getCouponResponseBody());
        errorResponse = getErrorResponse();
        state = getCheckoutStoreState();
        store = createCheckoutStore(state);

        checkoutClient = {
            applyCoupon: jest.fn(() => Promise.resolve(response)),
            removeCoupon: jest.fn(() => Promise.resolve(response)),
        };

        couponActionCreator = new CouponActionCreator(checkoutClient);
    });

    describe('#applyCoupon()', () => {
        beforeEach(() => {
            jest.spyOn(store, 'dispatch');
        });

        it('emits actions if able to apply coupon', () => {
            const coupon = 'myCouponCode1234';

            Observable.from(couponActionCreator.applyCoupon(coupon)(store))
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: CouponActionType.ApplyCouponRequested },
                        { type: CouponActionType.ApplyCouponSucceeded, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to apply coupon', () => {
            checkoutClient.applyCoupon.mockReturnValue(Promise.reject(errorResponse));

            const coupon = 'myCouponCode1234';
            const errorHandler = jest.fn((action) => Observable.of(action));

            Observable.from(couponActionCreator.applyCoupon(coupon)(store))
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
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

            Observable.from(couponActionCreator.removeCoupon(coupon)(store))
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: CouponActionType.RemoveCouponRequested },
                        { type: CouponActionType.RemoveCouponSucceeded, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to remove coupon', () => {
            checkoutClient.removeCoupon.mockReturnValue(Promise.reject(errorResponse));

            const coupon = 'myCouponCode1234';
            const errorHandler = jest.fn((action) => Observable.of(action));

            Observable.from(couponActionCreator.removeCoupon(coupon)(store))
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: CouponActionType.RemoveCouponRequested },
                        { type: CouponActionType.RemoveCouponFailed, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
