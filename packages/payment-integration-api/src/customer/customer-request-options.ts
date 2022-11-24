import { RequestOptions } from '../util-types';

export interface CustomerRequestOptions extends RequestOptions {
    methodId?: string;
}

export interface CustomerInitializeOptions extends CustomerRequestOptions {
    [key: string]: unknown;
}

export interface ExecutePaymentMethodCheckoutOptions
    extends CustomerRequestOptions {
    continueWithCheckoutCallback?(): void;
}
