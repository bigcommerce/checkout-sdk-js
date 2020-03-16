import { RequestOptions } from '../common/http-request';

import { CheckoutButtonMethodType } from './strategies';
import { BraintreePaypalButtonInitializeOptions } from './strategies/braintree';
import { GooglePayButtonInitializeOptions } from './strategies/googlepay';
import { PaypalButtonInitializeOptions } from './strategies/paypal';
import { PaypalCommerceButtonInitializeOptions } from './strategies/paypal-commerce';

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
     * The options that are required to facilitate PayPal. They can be omitted
     * unless you need to support Paypal.
     */
    paypal?: PaypalButtonInitializeOptions;

    /**
     * The options that are required to facilitate PayPal Commerce. They can be omitted
     * unless you need to support Paypal.
     */
    paypalCommerce?: PaypalCommerceButtonInitializeOptions;

    /**
     * The ID of a container which the checkout button should be inserted.
     */
    containerId: string;

    /**
     * The options that are required to facilitate Braintree GooglePay. They can be
     * omitted unles you need to support Braintree GooglePay.
     */
    googlepaybraintree?: GooglePayButtonInitializeOptions;

    /**
     * The options that are required to facilitate Stripe GooglePay. They can be
     * omitted unles you need to support Stripe GooglePay.
     */
    googlepaystripe?: GooglePayButtonInitializeOptions;

    /**
     * The options that are required to facilitate Authorize.Net GooglePay.
     * They can be omitted unles you need to support Authorize.Net GooglePay.
     */
    googlepayauthorizenet?: GooglePayButtonInitializeOptions;
}
