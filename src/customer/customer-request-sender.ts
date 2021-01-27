import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions } from '../common/http-request';

import Customer from './customer';
import { CustomerAccountInternalRequestBody, CustomerAddressRequestBody } from './customer-account';
import CustomerCredentials from './customer-credentials';
import { InternalCustomerResponseBody } from './internal-customer-responses';

export default class CustomerRequestSender {
    constructor(
        private _requestSender: RequestSender
    ) {}

    createAccount(customerAccount: CustomerAccountInternalRequestBody, { timeout }: RequestOptions = {}): Promise<Response<{}>> {
        const url = '/api/storefront/customer';

        return this._requestSender.post(url, { timeout, body: customerAccount });
    }

    createAddress(customerAddress: CustomerAddressRequestBody, { timeout }: RequestOptions = {}): Promise<Response<Customer>> {
        const url = `/api/storefront/customer-address`;

        return this._requestSender.post<Customer>(url, { timeout, body: customerAddress });
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
