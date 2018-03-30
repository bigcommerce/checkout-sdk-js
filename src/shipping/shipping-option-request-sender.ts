import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class ShippingOptionRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    loadShippingOptions({ timeout }: RequestOptions = {}): Promise<Response> {
        const url = '/internalapi/v1/checkout/shippingoptions';

        const params = {
            includes: ['cart', 'quote', 'shippingOptions'].join(','),
        };

        return this._requestSender.get(url, { params, timeout });
    }

    selectShippingOption(addressId: string, shippingOptionId: string, { timeout }: RequestOptions = {}): Promise<Response> {
        const body = { addressId, shippingOptionId };
        const url = '/internalapi/v1/checkout/shippingoptions';

        const params = {
            includes: ['cart', 'quote', 'shippingOptions'].join(','),
        };

        return this._requestSender.put(url, { body, params, timeout });
    }
}
