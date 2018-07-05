import { RequestOptions } from '../common/http-request';

import { AmazonPayCustomerInitializeOptions, BraintreeVisaCheckoutCustomerInitializeOptions, ChasePayCustomerInitializeOptions } from './strategies';

/**
 * A set of options for configuring any requests related to the customer step of
 * the current checkout flow.
 *
 * Some payment methods have their own sign-in or sign-out flow. Therefore, you
 * need to indicate the method you want to use if you need to trigger a specific
 * flow for signing in or out a customer. Otherwise, these options are not required.
 */
export interface CustomerRequestOptions extends RequestOptions {
    methodId?: string;
}

/**
 * A set of options that are required to initialize the customer step of the
 * current checkout flow.
 *
 * Some payment methods have specific requirements for setting the customer
 * details for checkout. For example, Amazon Pay requires the customer to sign in
 * using their sign-in button. As a result, you may need to provide additional
 * information in order to initialize the customer step of checkout.
 */
export interface CustomerInitializeOptions extends CustomerRequestOptions {
    /**
     * The options that are required to initialize the customer step of checkout
     * when using Amazon Pay.
     */
    amazon?: AmazonPayCustomerInitializeOptions;

    /**
     * The options that are required to initialize the customer step of checkout
     * when using Visa Checkout provided by Braintree.
     */
    braintreevisacheckout?: BraintreeVisaCheckoutCustomerInitializeOptions;

    /**
     * The options that are required to initialize the Chasepay payment method.
     * They can be omitted unless you need to support Chasepay.
     */
    chasepay?: ChasePayCustomerInitializeOptions;
}
