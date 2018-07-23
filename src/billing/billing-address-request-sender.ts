import { RequestSender, Response } from '@bigcommerce/request-sender';

import { AddressRequestBody } from '../address';
import { Checkout } from '../checkout';
import { ContentType, RequestOptions } from '../common/http-request';

import { BillingAddressUpdateRequestBody } from './billing-address';

const DEFAULT_PARAMS = {
    include: [
        'cart.lineItems.physicalItems.options',
        'cart.lineItems.digitalItems.options',
        'customer',
        'promotions.banners',
    ].join(','),
};

export default class BillingAddressRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    createAddress(checkoutId: string, address: Partial<AddressRequestBody>, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const url = `/api/storefront/checkouts/${checkoutId}/billing-address`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.post(url, { body: address, params: DEFAULT_PARAMS, headers, timeout });
    }

    updateAddress(checkoutId: string, address: Partial<BillingAddressUpdateRequestBody>, { timeout }: RequestOptions = {}): Promise<Response<Checkout>> {
        const { id, ...body } = address;
        const url = `/api/storefront/checkouts/${checkoutId}/billing-address/${id}`;
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.put(url, { params: DEFAULT_PARAMS, body, headers, timeout });
    }
}
