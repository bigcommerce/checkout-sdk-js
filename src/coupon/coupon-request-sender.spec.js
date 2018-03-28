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

    const checkoutId = 'checkoutId1234';
    const couponCode = 'myCouponCode1234';

    describe('#applyCoupon()', () => {
        it('applies coupon code', async () => {
            const response = getResponse(getCouponResponseBody());
            requestSender.post.mockReturnValue(Promise.resolve(response));

            const output = await couponRequestSender.applyCoupon(checkoutId, couponCode);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/coupons', {
                body: { couponCode },
            });
        });

        it('applies coupon with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getCouponResponseBody());
            requestSender.post.mockReturnValue(Promise.resolve(response));

            const output = await couponRequestSender.applyCoupon(checkoutId, couponCode, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/coupons', {
                ...options,
                body: { couponCode },
            });
        });
    });

    describe('#removeCoupon()', () => {
        it('removes coupon code', async () => {
            const response = getResponse(getCouponResponseBody());
            requestSender.delete.mockReturnValue(Promise.resolve(response));

            const output = await couponRequestSender.removeCoupon(checkoutId, couponCode);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/coupons/myCouponCode1234', {});
        });

        it('removes coupon code with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getCouponResponseBody());
            requestSender.delete.mockReturnValue(Promise.resolve(response));

            const output = await couponRequestSender.removeCoupon(checkoutId, couponCode, options);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/coupons/myCouponCode1234', options);
        });
    });
});
