import { RequestOptions } from '../common/http-request';

import { AmazonPayV2CustomerInitializeOptions } from './strategies/amazon-pay-v2';
import { BoltCustomerInitializeOptions } from './strategies/bolt';
import {
    BraintreePaypalCustomerInitializeOptions,
    BraintreeVisaCheckoutCustomerInitializeOptions,
} from './strategies/braintree';
import { ChasePayCustomerInitializeOptions } from './strategies/chasepay';
import { GooglePayCustomerInitializeOptions } from './strategies/googlepay';
import { MasterpassCustomerInitializeOptions } from './strategies/masterpass';
import { StripeUPECustomerInitializeOptions } from './strategies/stripe-upe';

export { CustomerInitializeOptions } from '../generated/customer-initialize-options';

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
export interface BaseCustomerInitializeOptions extends CustomerRequestOptions {
    [key: string]: unknown;

    /**
     * The options that are required to initialize the customer step of checkout
     * when using AmazonPayV2.
     */
    amazonpay?: AmazonPayV2CustomerInitializeOptions;

    /**
     * The options that are required to initialize the customer step of checkout
     * when using Braintree PayPal provided.
     */
    braintreepaypal?: BraintreePaypalCustomerInitializeOptions;

    /**
     * The options that are required to initialize the customer step of checkout
     * when using Visa Checkout provided by Braintree.
     */
    braintreevisacheckout?: BraintreeVisaCheckoutCustomerInitializeOptions;

    /**
     * The options that are required to initialize the customer step of checkout
     * when using Bolt.
     */
    bolt?: BoltCustomerInitializeOptions;

    /**
     * The options that are required to initialize the Chasepay payment method.
     * They can be omitted unless you need to support Chasepay.
     */
    chasepay?: ChasePayCustomerInitializeOptions;

    /**
     * The options that are required to initialize the Masterpass payment method.
     * They can be omitted unless you need to support Masterpass.
     */
    masterpass?: MasterpassCustomerInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepayadyenv2?: GooglePayCustomerInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepayadyenv3?: GooglePayCustomerInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepayauthorizenet?: GooglePayCustomerInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaybnz?: GooglePayCustomerInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaybraintree?: GooglePayCustomerInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaycheckoutcom?: GooglePayCustomerInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaycybersourcev2?: GooglePayCustomerInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepayorbital?: GooglePayCustomerInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaystripe?: GooglePayCustomerInitializeOptions;

    /**
     * The options that are required to initialize the GooglePay payment method.
     * They can be omitted unless you need to support GooglePay.
     */
    googlepaystripeupe?: GooglePayCustomerInitializeOptions;

    /**
     * The options that are required to initialize the Customer Stripe Upe payment method.
     * They can be omitted unless you need to support Customer Stripe Upe.
     */
    stripeupe?: StripeUPECustomerInitializeOptions;
}

/**
 * A set of options that are required to pass the customer step of the
 * current checkout flow.
 *
 * Some payment methods have specific suggestion for customer to pass
 * the customer step. For example, Bolt suggests the customer to use
 * their custom checkout with prefilled form values. As a result, you
 * may need to provide additional information, error handler or callback
 * to execution method.
 *
 */
export interface ExecutePaymentMethodCheckoutOptions extends CustomerRequestOptions {
    checkoutPaymentMethodExecuted?(data?: CheckoutPaymentMethodExecutedOptions): void;
    continueWithCheckoutCallback?(): void;
}

export interface CheckoutPaymentMethodExecutedOptions {
    hasBoltAccount?: boolean;
}
