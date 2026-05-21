import { RequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';

export interface GraphQLRequestOptions extends RequestOptions {
    body?: { query: string; variables: Record<string, unknown> };
    headers?: { [key: string]: string };
}
