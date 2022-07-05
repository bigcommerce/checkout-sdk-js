import { ApplePayButtonInitializeOptions } from '../strategy/checkout-button-initialize-options.ts';
import RequestOptions from '../util-types/request-options';
import CheckoutButtonMethodType from './checkout-button-method-type';


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
     * The options that are required to initialize the ApplePay payment method.
     * They can be omitted unless you need to support ApplePay in cart.
     */
    applepay?: ApplePayButtonInitializeOptions;

    /**
     * The ID of a container which the checkout button should be inserted.
     */
    containerId: string;
}
