import { RequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';

export interface GraphQLRequestOptions extends RequestOptions {
    body?: { query: string };
    headers?: { [key: string]: string };
}
