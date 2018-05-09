import { RequestSender, Response } from '@bigcommerce/request-sender';

import { Address } from '../address';
import { Checkout } from '../checkout';
import { ContentType, RequestOptions } from '../common/http-request';

export default class BillingAddressRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    createAddress(checkoutId: string, address: Address, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/billing-address`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.post(url, { body: address, headers, timeout });
    }

    updateAddress(checkoutId: string, address: Address, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const { id, ...body } = address;
        const url = `/api/storefront/checkouts/${checkoutId}/billing-address/${id}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.put(url, { body, headers, timeout });
    }
}
