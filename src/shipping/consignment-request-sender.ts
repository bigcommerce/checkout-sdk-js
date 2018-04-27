import { RequestSender, Response } from '@bigcommerce/request-sender';

import { Checkout } from '../checkout';
import { RequestOptions } from '../common/http-request';

import { ConsignmentsRequestBody, ConsignmentRequestBody } from './consignment';

const DEFAULT_PARAMS = {
    include: 'consignments.availableShippingOptions',
};

export default class ConsignmentRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    createConsignments(checkoutId: string, consignments: ConsignmentsRequestBody, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/consignments`;

        return this._requestSender.post(url, { body: consignments, params: DEFAULT_PARAMS, timeout });
    }

    updateConsignment(checkoutId: string, consignment: ConsignmentRequestBody, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const { id, ...body } = consignment;
        const url = `/api/storefront/checkouts/${checkoutId}/consignments/${id}`;

        return this._requestSender.put(url, { body, params: DEFAULT_PARAMS, timeout });
    }
}
