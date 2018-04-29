import { RequestOptions } from '../common/http-request';

import { AmazonPayShippingInitializeOptions } from './strategies';

export interface ShippingRequestOptions extends RequestOptions {
    methodId?: string;
}

export interface ShippingInitializeOptions extends ShippingRequestOptions {
    amazon?: AmazonPayShippingInitializeOptions;
}
