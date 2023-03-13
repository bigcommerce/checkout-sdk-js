import { RequestOptions } from '../common/http-request';

import { CheckoutButtonMethodType } from './strategies';
import { AmazonPayV2ButtonInitializeOptions } from './strategies/amazon-pay-v2';
import { ApplePayButtonInitializeOptions } from './strategies/apple-pay';
import {
    BraintreePaypalButtonInitializeOptions,
    BraintreePaypalCreditButtonInitializeOptions,
    BraintreeVenmoButtonInitializeOptions,
} from './strategies/braintree';
import { GooglePayButtonInitializeOptions } from './strategies/googlepay';
import { PaypalButtonInitializeOptions } from './strategies/paypal';

export { CheckoutButtonInitializeOptions } from '../generated/checkout-button-initialize-options';

/**
 * The set of options for configuring the checkout button.
 */
export interface CheckoutButtonOptions extends RequestOptions {
    /**
     * The identifier of the payment method.
     */
    methodId: CheckoutButtonMethodType;
}

export interface BaseCheckoutButtonInitializeOptions extends CheckoutButtonOptions {
    [key: string]: unknown;

    /**
     * The options that are required to initialize the ApplePay payment method.
     * They can be omitted unless you need to support ApplePay in cart.
     */
    applepay?: ApplePayButtonInitializeOptions;

    /**
     * The options that are required to facilitate AmazonPayV2. They can be
     * omitted unless you need to support AmazonPayV2.
     */
    amazonpay?: AmazonPayV2ButtonInitializeOptions;

    /**
     * The options that are required to facilitate Braintree PayPal. They can be
     * omitted unless you need to support Braintree PayPal.
     */
    braintreepaypal?: BraintreePaypalButtonInitializeOptions;

    /**
     * The options that are required to facilitate Braintree Credit. They can be
     * omitted unless you need to support Braintree Credit.
     */
    braintreepaypalcredit?: BraintreePaypalCreditButtonInitializeOptions;

    /**
     * The options that are required to facilitate Braintree Venmo. They can be
     * omitted unless you need to support Braintree Venmo.
     */
    braintreevenmo?: BraintreeVenmoButtonInitializeOptions;

    /**
     * The ID of a container which the checkout button should be inserted.
     */
    containerId: string;

    /**
     * The option that is required to load payment method configuration for provided currency code in Buy Now flow.
     */
    currencyCode?: string;

    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support adyenv2 GooglePay.
     */
    googlepayadyenv2?: GooglePayButtonInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support adyenv2 GooglePay.
     */
    googlepayadyenv3?: GooglePayButtonInitializeOptions;

    /**
     * The options that are required to facilitate BNZ GooglePay. They can be
     * omitted unless you need to support BNZ GooglePay.
     */
    googlepaybnz?: GooglePayButtonInitializeOptions;

    /**
     * The options that are required to facilitate Braintree GooglePay. They can be
     * omitted unless you need to support Braintree GooglePay.
     */
    googlepaybraintree?: GooglePayButtonInitializeOptions;

    /**
     * The options that are required to facilitate Checkout.com GooglePay. They can be
     * omitted unless you need to support Checkout.com GooglePay.
     */
    googlepaycheckoutcom?: GooglePayButtonInitializeOptions;

    /**
     * The options that are required to facilitate CybersourceV2 GooglePay. They can be
     * omitted unless you need to support CybersourceV2 GooglePay.
     */
    googlepaycybersourcev2?: GooglePayButtonInitializeOptions;

    /**
     * The options that are required to facilitate Orbital GooglePay. They can be
     * omitted unless you need to support Orbital GooglePay.
     */
    googlepayorbital?: GooglePayButtonInitializeOptions;

    /**
     * The options that are required to facilitate Stripe GooglePay. They can be
     * omitted unless you need to support Stripe GooglePay.
     */
    googlepaystripe?: GooglePayButtonInitializeOptions;

    /**
     * The options that are required to facilitate Stripe GooglePay. They can be
     * omitted unless you need to support Stripe GooglePay.
     */
    googlepaystripeupe?: GooglePayButtonInitializeOptions;

    /**
     * The options that are required to facilitate Authorize.Net GooglePay.
     * They can be omitted unless you need to support Authorize.Net GooglePay.
     */
    googlepayauthorizenet?: GooglePayButtonInitializeOptions;

    /**
     * The options that are required to facilitate Worldpay GooglePay. They can be
     * omitted unless you need to support Worldpay GooglePay.
     */
    googlepayworldpayaccess?: GooglePayButtonInitializeOptions;

    /**
     * The options that are required to facilitate PayPal. They can be omitted
     * unless you need to support Paypal.
     */
    paypal?: PaypalButtonInitializeOptions;
}
