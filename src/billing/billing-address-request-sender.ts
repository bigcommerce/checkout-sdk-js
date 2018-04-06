import { RequestSender, Response } from '@bigcommerce/request-sender';

import { InternalAddress } from '../address';
import { RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class BillingAddressRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    updateAddress(address: InternalAddress, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/internalapi/v1/checkout/billing';

        const params = {
            includes: ['cart', 'quote'].join(','),
        };

        return this._requestSender.post(url, { body: address, params, timeout });
    }
}
