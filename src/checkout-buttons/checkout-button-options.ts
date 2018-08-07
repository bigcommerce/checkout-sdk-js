import { RequestOptions } from '../common/http-request';

import { BraintreePaypalButtonInitializeOptions } from './strategies';

export interface CheckoutButtonOptions extends RequestOptions {
    methodId: string;
}

export interface CheckoutButtonInitializeOptions extends CheckoutButtonOptions {
    braintreepaypal?: BraintreePaypalButtonInitializeOptions;
    braintreepaypalcredit?: BraintreePaypalButtonInitializeOptions;
}
