import { RequestSender, Response } from '@bigcommerce/request-sender';

import { Checkout, CheckoutIncludes, CHECKOUT_DEFAULT_INCLUDES } from '../checkout';
import { joinIncludes, ContentType, RequestOptions } from '../common/http-request';

export default class CouponRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    applyCoupon(checkoutId: string, couponCode: string, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/coupons`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.post(url, {
            headers,
            timeout,
            params: {
                include: joinIncludes([
                    ...CHECKOUT_DEFAULT_INCLUDES,
                    CheckoutIncludes.AvailableShippingOptions,
                ]),
            },
            body: { couponCode },
        });
    }

    removeCoupon(checkoutId: string, couponCode: string, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/coupons/${couponCode}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.delete(url, {
            headers,
            timeout,
            params: {
                include: joinIncludes([
                    ...CHECKOUT_DEFAULT_INCLUDES,
                    CheckoutIncludes.AvailableShippingOptions,
                ]),
            },
        });
    }
}
