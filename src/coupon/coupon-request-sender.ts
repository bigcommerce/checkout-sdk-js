import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class CouponRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    applyCoupon(couponCode: string, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/internalapi/v1/checkout/coupon';

        return this._requestSender.post(url, { timeout, body: { couponCode } });
    }

    removeCoupon(couponCode: string, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = `/internalapi/v1/checkout/coupon/${couponCode}`;

        return this._requestSender.delete(url, { timeout });
    }
}
