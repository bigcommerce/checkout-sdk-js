import { RequestSender, Response } from '@bigcommerce/request-sender';

import { Checkout, CheckoutParams } from '../checkout';
import { joinIncludes, joinOrMergeIncludes, ContentType, RequestOptions } from '../common/http-request';

import { ConsignmentsRequestBody, ConsignmentUpdateRequestBody } from './consignment';

const DEFAULT_INCLUDES = [
        'consignments.availableShippingOptions',
        'cart.lineItems.physicalItems.options',
        'cart.lineItems.digitalItems.options',
        'customer',
        'promotions.banners',
    ];

export default class ConsignmentRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    createConsignments(
        checkoutId: string,
        consignments: ConsignmentsRequestBody,
        { timeout, params: { include } = {} }: RequestOptions<CheckoutParams> = {}
    ): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/consignments`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.post(url, {
            body: consignments,
            params: {
                include: joinOrMergeIncludes(DEFAULT_INCLUDES, include),
            },
            headers,
            timeout,
        });
    }

    updateConsignment(
        checkoutId: string,
        consignment: ConsignmentUpdateRequestBody,
        { timeout, params: { include } = {} }: RequestOptions<CheckoutParams> = {}
    ): Promise<Response<Checkout>> {
        const { id, ...body } = consignment;
        const url = `/api/storefront/checkouts/${checkoutId}/consignments/${id}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.put(url, {
            body,
            params: {
                include: joinOrMergeIncludes(DEFAULT_INCLUDES, include),
            },
            headers,
            timeout,
        });
    }

    deleteConsignment(
        checkoutId: string,
        consignmentId: string,
        { timeout }: RequestOptions = {}
    ): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/consignments/${consignmentId}`;
        const headers = { Accept: ContentType.JsonV1 };
        const include = joinIncludes(DEFAULT_INCLUDES);

        return this._requestSender.delete(url, { params: { include }, headers, timeout });
    }
}
