import { RequestSender, Response } from '@bigcommerce/request-sender';

import { AddressRequestBody } from '../address';
import { EmptyCartError } from '../cart/errors';
import { Checkout } from '../checkout';
import { ContentType, RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

import { BillingAddressUpdateRequestBody } from './billing-address';

const DEFAULT_PARAMS = {
    include: [
        'cart.lineItems.physicalItems.options',
        'cart.lineItems.digitalItems.options',
        'customer',
        'promotions.banners',
    ].join(','),
};

export default class BillingAddressRequestSender {
    constructor(private _requestSender: RequestSender) {}

    createAddress(
        checkoutId: string,
        address: Partial<AddressRequestBody>,
        { timeout }: RequestOptions = {},
    ): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/billing-address`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender
            .post<Checkout>(url, {
                body: address,
                params: DEFAULT_PARAMS,
                headers,
                timeout,
            })
            .catch((err) => {
                if (err.body.type === 'empty_cart') {
                    throw new EmptyCartError();
                }

                throw err;
            });
    }

    updateAddress(
        checkoutId: string,
        address: Partial<BillingAddressUpdateRequestBody>,
        { timeout }: RequestOptions = {},
    ): Promise<Response<Checkout>> {
        const { id, ...body } = address;
        const url = `/api/storefront/checkouts/${checkoutId}/billing-address/${id}`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender
            .put<Checkout>(url, { params: DEFAULT_PARAMS, body, headers, timeout })
            .catch((err) => {
                if (err.body.type === 'empty_cart') {
                    throw new EmptyCartError();
                }

                throw err;
            });
    }
}
