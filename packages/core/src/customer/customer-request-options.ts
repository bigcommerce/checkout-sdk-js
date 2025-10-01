import {
    CustomerStrategy,
    CustomerStrategyFactory,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { RequestOptions } from '../common/http-request';

import { MasterpassCustomerInitializeOptions } from './strategies/masterpass';

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
     * @alpha
     */
    integrations?: Array<CustomerStrategyFactory<CustomerStrategy>>;

    /**
     * The options that are required to initialize the Masterpass payment method.
     * They can be omitted unless you need to support Masterpass.
     */
    masterpass?: MasterpassCustomerInitializeOptions;
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
