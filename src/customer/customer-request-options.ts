import { RequestOptions } from '../common/http-request';

import { AmazonPayCustomerInitializeOptions } from './strategies';

export interface CustomerRequestOptions extends RequestOptions {
    methodId?: string;
}

export interface CustomerInitializeOptions extends CustomerRequestOptions {
    amazon?: AmazonPayCustomerInitializeOptions;
}
