import { RequestSender, Response } from '@bigcommerce/request-sender';

import { ContentType, RequestOptions } from '../common/http-request';

import { CurrentCustomer } from './customer';
import CustomerCredentials from './customer-credentials';
import { InternalCustomerResponseBody } from './internal-customer-responses';

export default class CustomerRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    updateCustomer(customer: CurrentCustomer, { timeout }: RequestOptions = {}): Promise<Response<CurrentCustomer>> {
        const url = '/api/storefront/customer';
        const headers = { Accept: ContentType.JsonV1 };

        return this._requestSender.post(url, { body: customer, headers, timeout });
    }

    signInCustomer(credentials: CustomerCredentials, { timeout }: RequestOptions = {}): Promise<Response<InternalCustomerResponseBody>> {
        const url = '/internalapi/v1/checkout/customer';

        return this._requestSender.post(url, { timeout, body: credentials });
    }

    signOutCustomer({ timeout }: RequestOptions = {}): Promise<Response<InternalCustomerResponseBody>> {
        const url = '/internalapi/v1/checkout/customer';

        return this._requestSender.delete(url, { timeout });
    }
}
