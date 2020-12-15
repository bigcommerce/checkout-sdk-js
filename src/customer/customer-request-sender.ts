import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

import CustomerCredentials from './customer-credentials';
import { InternalCustomerResponseBody } from './internal-customer-responses';

export default class CustomerRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    signInCustomer(credentials: CustomerCredentials, { timeout }: RequestOptions = {}): Promise<Response<InternalCustomerResponseBody>> {
        const url = '/internalapi/v1/checkout/customer';

        return this._requestSender.post(url, { timeout, body: credentials });
    }

    signOutCustomer({ timeout }: RequestOptions = {}): Promise<Response<InternalCustomerResponseBody>> {
        const url = '/internalapi/v1/checkout/customer';

        return this._requestSender.delete(url, { timeout });
    }
}
