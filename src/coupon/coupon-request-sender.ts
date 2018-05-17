import { RequestSender, Response } from '@bigcommerce/request-sender';

import { Checkout } from '../checkout';
import { ContentType, RequestOptions } from '../common/http-request';

export default class CouponRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    applyCoupon(checkoutId: string, couponCode: string, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/coupons`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.post(url, { headers, timeout, body: { couponCode } });
    }

    removeCoupon(checkoutId: string, couponCode: string, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/coupons/${couponCode}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.delete(url, { headers, timeout });
    }
}
