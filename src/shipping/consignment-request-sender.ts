import { RequestSender, Response } from '@bigcommerce/request-sender';

import { Checkout } from '../checkout';
import { ContentType, RequestOptions } from '../common/http-request';

import { ConsignmentsRequestBody, ConsignmentUpdateRequestBody } from './consignment';

const DEFAULT_PARAMS = {
    include: [
        'consignments.availableShippingOptions',
        'cart.lineItems.physicalItems.options',
        'cart.lineItems.digitalItems.options',
        'customer',
        'promotions.banners',
    ].join(','),
};

export default class ConsignmentRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    createConsignments(checkoutId: string, consignments: ConsignmentsRequestBody, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/consignments`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.post(url, { body: consignments, params: DEFAULT_PARAMS, headers, timeout });
    }

    updateConsignment(checkoutId: string, consignment: ConsignmentUpdateRequestBody, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const { id, ...body } = consignment;
        const url = `/api/storefront/checkouts/${checkoutId}/consignments/${id}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.put(url, { params: DEFAULT_PARAMS, body, headers, timeout });
    }

    deleteConsignment(checkoutId: string, consignmentId: string, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/consignments/${consignmentId}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.delete(url, { params: DEFAULT_PARAMS, headers, timeout });
    }
}
