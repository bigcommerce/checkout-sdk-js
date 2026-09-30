import { RequestSender, Response } from '@bigcommerce/request-sender';
import { isNil, omitBy } from 'lodash';

import {
    CartConsistencyError,
    CartStockPositionsChangedError,
    EmptyCartError,
} from '../cart/errors';
import {
    ContentType,
    joinIncludes,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '../common/http-request';

import { MissingShippingMethodError, OrderTaxProviderUnavailableError } from './errors';
import InvalidShippingAddressError from './errors/invalid-shipping-address-error';
import InternalOrderRequestBody from './internal-order-request-body';
import { InternalOrderResponseBody } from './internal-order-responses';
import Order from './order';

export interface SubmitOrderRequestOptions extends RequestOptions {
    headers?: {
        checkoutVariant?: string;
    };
    includeOrderDetails?: boolean;
}

const ORDER_DETAILS_INCLUDES = [
    'payments',
    'lineItems.physicalItems.socialMedia',
    'lineItems.physicalItems.options',
    'lineItems.physicalItems.categories',
    'lineItems.digitalItems.socialMedia',
    'lineItems.digitalItems.options',
    'lineItems.digitalItems.categories',
];

const CREATE_ORDER_DETAILS_INCLUDES = ORDER_DETAILS_INCLUDES.filter(
    (include) => include !== 'payments',
);

export default class OrderRequestSender {
    constructor(private _requestSender: RequestSender) {}

    loadOrder(orderId: number, { timeout }: RequestOptions = {}): Promise<Response<Order>> {
        const url = `/api/storefront/orders/${orderId}`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender.get(url, {
            params: {
                include: joinIncludes(ORDER_DETAILS_INCLUDES),
            },
            headers,
            timeout,
        });
    }

    submitOrder(
        body?: InternalOrderRequestBody,
        { headers, timeout, includeOrderDetails }: SubmitOrderRequestOptions = {},
    ): Promise<Response<InternalOrderResponseBody>> {
        const url = '/internalapi/v1/checkout/order';

        return this._requestSender
            .post<InternalOrderResponseBody>(url, {
                body,
                params: includeOrderDetails
                    ? { include: joinIncludes(CREATE_ORDER_DETAILS_INCLUDES) }
                    : undefined,
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

                if (error.body.type === 'cart_stock_positions_changed') {
                    const changedItemIds =
                        (error.body.errors as { changedItemIds?: string[] })?.changedItemIds ?? [];

                    throw new CartStockPositionsChangedError(changedItemIds);
                }

                if (error.body.type === 'missing_shipping_method') {
                    throw new MissingShippingMethodError(error.body.detail);
                }

                if (error.body.type === 'invalid_shipping_address') {
                    throw new InvalidShippingAddressError(error.body.detail);
                }

                if (error.body.type === 'empty_cart') {
                    throw new EmptyCartError();
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
