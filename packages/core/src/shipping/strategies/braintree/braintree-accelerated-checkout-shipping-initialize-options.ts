import { BraintreeConnectStylesOption } from '@bigcommerce/checkout-sdk/braintree-utils';

/**
 * A set of options that are required to initialize the shipping step of
 * checkout in order to support Braintree Accelerated Checkout.
 */
export default interface BraintreeAcceleratedCheckoutShippingInitializeOptions {
    /**
     * The identifier of the payment method.
     */
    methodId: string;

    /**
     * Is a stylisation options for customizing PayPal Connect components
     *
     * Note: the styles for all Braintree Accelerated Checkout strategies should be the same,
     * because they will be provided to PayPal library only for the first strategy initialization
     * no matter what strategy was initialised first
     */
    styles?: BraintreeConnectStylesOption;
}
