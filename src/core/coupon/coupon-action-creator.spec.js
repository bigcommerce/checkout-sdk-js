import { Observable } from 'rxjs';
import { getCouponResponseBody } from './coupon.mock';
import { getErrorResponseBody } from '../common/error/errors.mock';
import { getErrorResponse, getResponse } from '../../http-request/responses.mock';
import * as actionTypes from './coupon-action-types';
import createCheckoutStore from '../create-checkout-store';
import CouponActionCreator from './coupon-action-creator';

describe('CouponActionCreator', () => {
    let checkoutClient;
    let couponActionCreator;
    let errorResponse;
    let response;
    let store;

    beforeEach(() => {
        response = getResponse(getCouponResponseBody());
        errorResponse = getErrorResponse(getErrorResponseBody());
        store = createCheckoutStore();

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

            couponActionCreator.applyCoupon(coupon)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.APPLY_COUPON_REQUESTED },
                        { type: actionTypes.APPLY_COUPON_SUCCEEDED, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to apply coupon', () => {
            checkoutClient.applyCoupon.mockReturnValue(Promise.reject(errorResponse));

            const coupon = 'myCouponCode1234';
            const errorHandler = jest.fn((action) => Observable.of(action));

            couponActionCreator.applyCoupon(coupon)
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.APPLY_COUPON_REQUESTED },
                        { type: actionTypes.APPLY_COUPON_FAILED, payload: errorResponse, error: true },
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

            couponActionCreator.removeCoupon(coupon)
                .toArray()
                .subscribe((actions) => {
                    expect(actions).toEqual([
                        { type: actionTypes.REMOVE_COUPON_REQUESTED },
                        { type: actionTypes.REMOVE_COUPON_SUCCEEDED, payload: response.body.data },
                    ]);
                });
        });

        it('emits error actions if unable to remove coupon', () => {
            checkoutClient.removeCoupon.mockReturnValue(Promise.reject(errorResponse));

            const coupon = 'myCouponCode1234';
            const errorHandler = jest.fn((action) => Observable.of(action));

            couponActionCreator.removeCoupon(coupon)
                .catch(errorHandler)
                .toArray()
                .subscribe((actions) => {
                    expect(errorHandler).toHaveBeenCalled();
                    expect(actions).toEqual([
                        { type: actionTypes.REMOVE_COUPON_REQUESTED },
                        { type: actionTypes.REMOVE_COUPON_FAILED, payload: errorResponse, error: true },
                    ]);
                });
        });
    });
});
