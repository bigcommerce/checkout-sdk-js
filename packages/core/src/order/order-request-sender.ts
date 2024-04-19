import { RequestSender, Response } from '@bigcommerce/request-sender';
import { isNil, omitBy } from 'lodash';

import { CartConsistencyError } from '../cart/errors';
import {
    ContentType,
    joinIncludes,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '../common/http-request';

import { OrderTaxProviderUnavailableError } from './errors';
import InternalOrderRequestBody from './internal-order-request-body';
import { InternalOrderResponseBody } from './internal-order-responses';
import Order from './order';

export interface SubmitOrderRequestOptions extends RequestOptions {
    headers?: {
        checkoutVariant?: string;
    };
}

export default class OrderRequestSender {
    constructor(private _requestSender: RequestSender) {}

    loadOrder(orderId: number, { timeout }: RequestOptions = {}): Promise<Response<Order>> {
        const url = `/api/storefront/orders/${orderId}`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };
        const include = [
            'payments',
            'lineItems.physicalItems.socialMedia',
            'lineItems.physicalItems.options',
            'lineItems.physicalItems.categories',
            'lineItems.digitalItems.socialMedia',
            'lineItems.digitalItems.options',
            'lineItems.digitalItems.categories',
        ];

        return this._requestSender.get(url, {
            params: {
                include: joinIncludes(include),
            },
            headers,
            timeout,
        });
    }

    submitOrder(
        body?: InternalOrderRequestBody,
        { headers, timeout }: SubmitOrderRequestOptions = {},
    ): Promise<Response<InternalOrderResponseBody>> {
        const url = '/internalapi/v1/checkout/order';

        return this._requestSender
            .post<InternalOrderResponseBody>(url, {
                body,
                headers: omitBy(
                    {
                        'X-Checkout-Variant': headers && headers.checkoutVariant,
                        ...SDK_VERSION_HEADERS,
                    },
                    isNil,
                ),
                timeout,
            })
            .catch((error) => {
                if (error.body.type === 'tax_provider_unavailable') {
                    throw new OrderTaxProviderUnavailableError();
                }

                if (error.body.type === 'cart_has_changed') {
                    throw new CartConsistencyError();
                }

                throw error;
            });
    }

    finalizeOrder(
        orderId: number,
        { timeout }: RequestOptions = {},
    ): Promise<Response<InternalOrderResponseBody>> {
        const url = `/internalapi/v1/checkout/order/${orderId}`;

        return this._requestSender.post(url, { timeout, headers: SDK_VERSION_HEADERS });
    }
}
