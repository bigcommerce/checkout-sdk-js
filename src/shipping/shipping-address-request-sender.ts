import { RequestSender, Response } from '@bigcommerce/request-sender';

import { InternalAddress } from '../address';
import { RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 * i.e.: Response<T>
 */
export default class ShippingAddressRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    updateAddress(address: InternalAddress, { timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/internalapi/v1/checkout/shipping';

        const params = {
            includes: ['cart', 'quote', 'shippingOptions'].join(','),
        };

        return this._requestSender.post(url, { body: address, params, timeout });
    }
}
