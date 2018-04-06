import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class CouponRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    applyCoupon(checkoutId: string, couponCode: string, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/api/storefront/checkouts/${checkoutId}/coupons`;

        return this._requestSender.post(url, { timeout, body: { couponCode } });
    }

    removeCoupon(checkoutId: string, couponCode: string, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/api/storefront/checkouts/${checkoutId}/coupons/${couponCode}`;

        return this._requestSender.delete(url, { timeout });
    }
}
