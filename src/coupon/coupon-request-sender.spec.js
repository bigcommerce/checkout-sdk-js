import { createTimeout } from '@bigcommerce/request-sender';
import { getCouponResponseBody } from './internal-coupons.mock';
import { getResponse } from '../common/http-request/responses.mock';
import CouponRequestSender from './coupon-request-sender';

describe('Coupon Request Sender', () => {
    let couponRequestSender;
    let requestSender;

    beforeEach(() => {
        requestSender = {
            delete: jest.fn(() => Promise.resolve()),
            post: jest.fn(() => Promise.resolve()),
        };

        couponRequestSender = new CouponRequestSender(requestSender);
    });

    it('couponRequestSender is defined', () => {
        expect(couponRequestSender).toBeDefined();
    });

    describe('#applyCoupon()', () => {
        it('applies coupon code', async () => {
            const response = getResponse(getCouponResponseBody());

            requestSender.post.mockReturnValue(Promise.resolve(response));

            const couponCode = 'myCouponCode1234';
            const output = await couponRequestSender.applyCoupon(couponCode);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon', {
                body: { couponCode },
            });
        });

        it('applies coupon with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getCouponResponseBody());

            requestSender.post.mockReturnValue(Promise.resolve(response));

            const couponCode = 'myCouponCode1234';
            const output = await couponRequestSender.applyCoupon(couponCode, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon', {
                ...options,
                body: { couponCode },
            });
        });
    });

    describe('#removeCoupon()', () => {
        it('removes coupon code', async () => {
            const response = getResponse(getCouponResponseBody());

            requestSender.delete.mockReturnValue(Promise.resolve(response));

            const couponCode = 'myCouponCode1234';
            const output = await couponRequestSender.removeCoupon(couponCode);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon/myCouponCode1234', {});
        });

        it('removes coupon code with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getCouponResponseBody());

            requestSender.delete.mockReturnValue(Promise.resolve(response));

            const couponCode = 'myCouponCode1234';
            const output = await couponRequestSender.removeCoupon(couponCode, options);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/internalapi/v1/checkout/coupon/myCouponCode1234', options);
        });
    });
});
