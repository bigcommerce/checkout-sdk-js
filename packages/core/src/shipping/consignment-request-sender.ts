import { RequestSender, Response } from '@bigcommerce/request-sender';

import { AddressRequestBody, mapToAddressRequestBody } from '../address';
import { EmptyCartError } from '../cart/errors';
import { Checkout, CheckoutParams } from '../checkout';
import {
    ContentType,
    joinIncludes,
    joinOrMergeIncludes,
    RequestOptions,
    SDK_VERSION_HEADERS,
} from '../common/http-request';

import { ConsignmentsRequestBody, ConsignmentUpdateRequestBody } from './consignment';

// Strip address-book metadata that a selected `CustomerAddress` carries but the API
// does not accept from the consignment's `address`/`shippingAddress` before it is sent.
function stripConsignmentAddresses<
    T extends {
        address?: AddressRequestBody;
        shippingAddress?: AddressRequestBody;
    },
>(consignment: T): T {
    return {
        ...consignment,
        ...(consignment.address && {
            address: mapToAddressRequestBody(consignment.address),
        }),
        ...(consignment.shippingAddress && {
            shippingAddress: mapToAddressRequestBody(consignment.shippingAddress),
        }),
    };
}

const DEFAULT_INCLUDES = [
    'consignments.availableShippingOptions',
    'cart.lineItems.physicalItems.options',
    'cart.lineItems.physicalItems.stockPosition',
    'cart.lineItems.digitalItems.options',
    'cart.lineItems.digitalItems.stockPosition',
    'customer',
    'promotions.banners',
];

export default class ConsignmentRequestSender {
    constructor(private _requestSender: RequestSender) {}

    createConsignments(
        checkoutId: string,
        consignments: ConsignmentsRequestBody,
        { timeout, params: { include } = {} }: RequestOptions<CheckoutParams> = {},
    ): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/consignments`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender
            .post<Checkout>(url, {
                body: consignments.map(stripConsignmentAddresses),
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

    updateConsignment(
        checkoutId: string,
        consignment: ConsignmentUpdateRequestBody,
        { timeout, params: { include } = {} }: RequestOptions<CheckoutParams> = {},
    ): Promise<Response<Checkout>> {
        const { id, ...body } = consignment;
        const url = `/api/storefront/checkouts/${checkoutId}/consignments/${id}`;
        const strippedBody = stripConsignmentAddresses(body);
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };

        return this._requestSender
            .put<Checkout>(url, {
                body: strippedBody,
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

    deleteConsignment(
        checkoutId: string,
        consignmentId: string,
        { timeout }: RequestOptions = {},
    ): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/consignments/${consignmentId}`;
        const headers = {
            Accept: ContentType.JsonV1,
            ...SDK_VERSION_HEADERS,
        };
        const include = joinIncludes(DEFAULT_INCLUDES);

        return this._requestSender
            .delete<Checkout>(url, { params: { include }, headers, timeout })
            .catch((err) => {
                if (err.body.type === 'empty_cart') {
                    throw new EmptyCartError();
                }

                throw err;
            });
    }
}
