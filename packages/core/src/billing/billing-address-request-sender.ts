import { RequestSender, Response } from '@bigcommerce/request-sender';

import { AddressRequestBody, mapToAddressRequestBody } from '../address';
import { EmptyCartError } from '../cart/errors';
import { Checkout, CheckoutParams } from '../checkout';
import {
    ContentType,
    joinOrMergeIncludes,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '../common/http-request';

import { BillingAddressUpdateRequestBody } from './billing-address';

const DEFAULT_INCLUDES = [
    'cart.lineItems.physicalItems.options',
    'cart.lineItems.physicalItems.stockPosition',
    'cart.lineItems.digitalItems.options',
    'cart.lineItems.digitalItems.stockPosition',
    'customer',
    'promotions.banners',
];

export default class BillingAddressRequestSender {
    constructor(private _requestSender: RequestSender) {}

    createAddress(
        checkoutId: string,
        address: Partial<AddressRequestBody>,
        { timeout, params: { include } = {} }: RequestOptions<CheckoutParams> = {},
    ): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/billing-address`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender
            .post<Checkout>(url, {
                body: mapToAddressRequestBody(address),
                params: {
                    include: joinOrMergeIncludes(DEFAULT_INCLUDES, include),
                },
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
        { timeout, params: { include } = {} }: RequestOptions<CheckoutParams> = {},
    ): Promise<Response<Checkout>> {
        const { id, ...body } = address;
        const url = `/api/storefront/checkouts/${checkoutId}/billing-address/${id}`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender
            .put<Checkout>(url, {
                params: {
                    include: joinOrMergeIncludes(DEFAULT_INCLUDES, include),
                },
                body: mapToAddressRequestBody(body),
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
}
