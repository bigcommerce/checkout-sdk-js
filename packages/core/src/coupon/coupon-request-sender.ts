import { RequestSender, Response } from '@bigcommerce/request-sender';

import { EmptyCartError } from '../cart/errors';
import { Checkout, CHECKOUT_DEFAULT_INCLUDES, CheckoutIncludes } from '../checkout';
import {
    ContentType,
    joinIncludes,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '../common/http-request';

export default class CouponRequestSender {
    constructor(private _requestSender: RequestSender) {}

    applyCoupon(
        checkoutId: string,
        couponCode: string,
        { timeout }: RequestOptions = {},
    ): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/coupons`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender
            .post<Checkout>(url, {
                headers,
                timeout,
                params: {
                    include: joinIncludes([
                        ...CHECKOUT_DEFAULT_INCLUDES,
                        CheckoutIncludes.AvailableShippingOptions,
                    ]),
                },
                body: { couponCode },
            })
            .catch((err) => {
                if (err.body.type === 'empty_cart') {
                    throw new EmptyCartError();
                }

                throw err;
            });
    }

    removeCoupon(
        checkoutId: string,
        couponCode: string,
        { timeout }: RequestOptions = {},
    ): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/coupons/${couponCode}`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender
            .delete<Checkout>(url, {
                headers,
                timeout,
                params: {
                    include: joinIncludes([
                        ...CHECKOUT_DEFAULT_INCLUDES,
                        CheckoutIncludes.AvailableShippingOptions,
                    ]),
                },
            })
            .catch((err) => {
                if (err.body.type === 'empty_cart') {
                    throw new EmptyCartError();
                }

                throw err;
            });
    }
}
