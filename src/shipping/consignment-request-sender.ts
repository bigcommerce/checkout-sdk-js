import { RequestSender, Response } from '@bigcommerce/request-sender';

import { Checkout } from '../checkout';
import { RequestOptions } from '../common/http-request';

import { ConsignmentsRequestBody } from './consignment';

export default class ConsignmentRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    createConsignments(checkoutId: string, consignments: ConsignmentsRequestBody, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/consignments`;

        const params = {
            include: 'consignments.availableShippingOptions',
        };

        return this._requestSender.post(url, { body: consignments, params, timeout });
    }
}
