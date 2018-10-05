import { RequestOptions } from '../common/http-request';

import { BraintreePaypalButtonInitializeOptions, CheckoutButtonMethodType, GooglePayBraintreeButtonInitializeOptions } from './strategies';

/**
 * The set of options for configuring the checkout button.
 */
export interface CheckoutButtonOptions extends RequestOptions {
    /**
     * The identifier of the payment method.
     */
    methodId: CheckoutButtonMethodType;
}

export interface CheckoutButtonInitializeOptions extends CheckoutButtonOptions {
    /**
     * The options that are required to facilitate Braintree PayPal. They can be
     * omitted unless you need to support Braintree PayPal.
     */
    braintreepaypal?: BraintreePaypalButtonInitializeOptions;

    /**
     * The options that are required to facilitate Braintree Credit. They can be
     * omitted unless you need to support Braintree Credit.
     */
    braintreepaypalcredit?: BraintreePaypalButtonInitializeOptions;

    /**
     * The ID of a container which the checkout button should be inserted.
     */
    containerId: string;

    /**
     * The options that are required to facilitate Braintree GooglePay. They can be
     * omitted unles you need to support Braintree GooglePay.
     */
    googlepaybraintree?: GooglePayBraintreeButtonInitializeOptions;
}
