import { createRequestSender, createTimeout, RequestSender } from '@bigcommerce/request-sender';

import { getCheckoutWithCoupons } from '../checkout/checkouts.mock';
import { ContentType } from '../common/http-request';
import { getResponse } from '../common/http-request/responses.mock';

import CouponRequestSender from './coupon-request-sender';

describe('Coupon Request Sender', () => {
    let couponRequestSender: CouponRequestSender;
    let requestSender: RequestSender;
    const defaultIncludes = [
        'cart.lineItems.physicalItems.options',
        'cart.lineItems.digitalItems.options',
        'customer',
        'customer.customerGroup',
        'payments',
        'promotions.banners',
        'consignments.availableShippingOptions',
    ].join(',');

    beforeEach(() => {
        requestSender = createRequestSender();
        couponRequestSender = new CouponRequestSender(requestSender);
    });

    it('couponRequestSender is defined', () => {
        expect(couponRequestSender).toBeDefined();
    });

    const checkoutId = 'checkoutId1234';
    const couponCode = 'myCouponCode1234';

    describe('#applyCoupon()', () => {
        it('applies coupon code', async () => {
            const response = getResponse(getCheckoutWithCoupons());
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));

            const output = await couponRequestSender.applyCoupon(checkoutId, couponCode);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/coupons', {
                body: { couponCode },
                params: {
                    include: defaultIncludes,
                },
                headers: {
                    Accept: ContentType.JsonV1,
                },
            });
        });

        it('applies coupon with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getCheckoutWithCoupons());
            jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve(response));

            const output = await couponRequestSender.applyCoupon(checkoutId, couponCode, options);

            expect(output).toEqual(response);
            expect(requestSender.post).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/coupons', {
                ...options,
                body: { couponCode },
                params: {
                    include: defaultIncludes,
                },
                headers: {
                    Accept: ContentType.JsonV1,
                },
            });
        });
    });

    describe('#removeCoupon()', () => {
        it('removes coupon code', async () => {
            const response = getResponse(getCheckoutWithCoupons());
            jest.spyOn(requestSender, 'delete').mockReturnValue(Promise.resolve(response));

            const output = await couponRequestSender.removeCoupon(checkoutId, couponCode);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/coupons/myCouponCode1234', {
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include: defaultIncludes,
                },
            });
        });

        it('removes coupon code with timeout', async () => {
            const options = { timeout: createTimeout() };
            const response = getResponse(getCheckoutWithCoupons());
            jest.spyOn(requestSender, 'delete').mockReturnValue(Promise.resolve(response));

            const output = await couponRequestSender.removeCoupon(checkoutId, couponCode, options);

            expect(output).toEqual(response);
            expect(requestSender.delete).toHaveBeenCalledWith('/api/storefront/checkouts/checkoutId1234/coupons/myCouponCode1234', {
                ...options,
                headers: {
                    Accept: ContentType.JsonV1,
                },
                params: {
                    include: defaultIncludes,
                },
            });
        });
    });
});
