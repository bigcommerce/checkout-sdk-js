import { RequestOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';

export interface GraphQLRequestOptions extends RequestOptions {
    body?: { document: string; variables: string };
    headers?: { [key: string]: string };
}
