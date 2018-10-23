import { RequestOptions } from '../common/http-request';

<<<<<<< HEAD
import { BraintreePaypalButtonInitializeOptions, MasterpassButtonInitializeOptions } from './strategies';
=======
import { BraintreePaypalButtonInitializeOptions, CheckoutButtonMethodType } from './strategies';
>>>>>>> fix(checkout-button): CHECKOUT-3584 Allow rendering checkout buttons more than once

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
<<<<<<< HEAD
    masterpass?: MasterpassButtonInitializeOptions;
=======

    /**
     * The ID of a container which the checkout button should be inserted.
     */
    containerId: string;
>>>>>>> fix(checkout-button): CHECKOUT-3584 Allow rendering checkout buttons more than once
}
