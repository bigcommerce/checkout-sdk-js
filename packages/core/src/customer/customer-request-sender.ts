import { RequestSender, Response } from '@bigcommerce/request-sender';

import { RequestOptions, SDK_VERSION_HEADERS } from '../common/http-request';

import Customer from './customer';
import { CustomerAccountInternalRequestBody, CustomerAddressRequestBody } from './customer-account';
import CustomerCredentials from './customer-credentials';
import { HeadlessCustomerRequestResponse } from './headless-customer/headless-customer-request-response';
import mapToCustomer from './headless-customer/map-to-customer';
import { InternalCustomerResponseBody } from './internal-customer-responses';

export default class CustomerRequestSender {
    constructor(private _requestSender: RequestSender) {}

    createAccount(
        customerAccount: CustomerAccountInternalRequestBody,
        { timeout }: RequestOptions = {},
    ): Promise<Response<{}>> {
        const url = '/api/storefront/customer';

        return this._requestSender.post(url, {
            timeout,
            headers: SDK_VERSION_HEADERS,
            body: customerAccount,
        });
    }

    getHeadlessCustomer(host?: string, options: RequestOptions = {}): Promise<Response<Customer>> {
        const path = 'get-customer';
        const url = host ? `${host}/${path}` : `/${path}`;

        return this._requestSender
            .get<HeadlessCustomerRequestResponse>(url, {
                ...options,
            })
            .then(this.transformToCustomerResponse);
    }

    createAddress(
        customerAddress: CustomerAddressRequestBody,
        { timeout }: RequestOptions = {},
    ): Promise<Response<Customer>> {
        const url = `/api/storefront/customer-address`;

        return this._requestSender.post<Customer>(url, {
            timeout,
            headers: SDK_VERSION_HEADERS,
            body: customerAddress,
        });
    }

    signInCustomer(
        credentials: CustomerCredentials,
        { timeout }: RequestOptions = {},
    ): Promise<Response<InternalCustomerResponseBody>> {
        const url = '/internalapi/v1/checkout/customer';

        return this._requestSender.post(url, {
            timeout,
            headers: SDK_VERSION_HEADERS,
            body: credentials,
        });
    }

    signOutCustomer({ timeout }: RequestOptions = {}): Promise<
        Response<InternalCustomerResponseBody>
    > {
        const url = '/internalapi/v1/checkout/customer';

        return this._requestSender.delete(url, { timeout, headers: SDK_VERSION_HEADERS });
    }

    private transformToCustomerResponse(
        response: Response<HeadlessCustomerRequestResponse>,
    ): Response<Customer> {
        const {
            body: {
                data: { site },
            },
        } = response;

        return {
            ...response,
            // TODO:: need to update HeadlessCustomerRequestResponse providing all required data
            // eslint-disable-next-line
            // @ts-ignore
            body: mapToCustomer(site),
        };
    }
}
