import { ShippingRequestOptions } from './shipping-request-options';

export interface ShippingInitializeOptions extends ShippingRequestOptions {
    [key: string]: unknown;
}
