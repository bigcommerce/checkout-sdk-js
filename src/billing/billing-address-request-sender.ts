import { RequestSender, Response } from '@bigcommerce/request-sender';

import { Address } from '../address';
import { Checkout } from '../checkout';
import { RequestOptions } from '../common/http-request';

export default class BillingAddressRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    createAddress(checkoutId: string, address: Address, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/billing-address`;

        return this._requestSender.post(url, { body: address, timeout });
    }

    updateAddress(checkoutId: string, address: Address, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const { id, ...body } = address;
        const url = `/api/storefront/checkouts/${checkoutId}/billing-address/${id}`;

        return this._requestSender.put(url, { body, timeout });
    }
}
