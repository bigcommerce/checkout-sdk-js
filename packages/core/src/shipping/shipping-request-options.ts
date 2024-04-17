import { RequestOptions } from '../common/http-request';

import { AmazonPayV2ShippingInitializeOptions } from './strategies/amazon-pay-v2';
import { BraintreeAcceleratedCheckoutInitializeOptions } from './strategies/braintree';
import { StripeUPEShippingInitializeOptions } from './strategies/stripe-upe';
import { PayPalCommerceFastlaneShippingInitializeOptions } from './strategies/paypal-commerce';

/**
 * A set of options for configuring any requests related to the shipping step of
 * the current checkout flow.
 *
 * Some payment methods have their own shipping configuration flow. Therefore,
 * you need to specify the method you intend to use if you want to trigger a
 * specific flow for setting the shipping address or option. Otherwise, these
 * options are not required.
 */
export interface ShippingRequestOptions<T = {}> extends RequestOptions<T> {
    methodId?: string;
}

/**
 * A set of options that are required to initialize the shipping step of the
 * current checkout flow.
 *
 * Some payment methods have specific requirements for setting the shipping
 * details for checkout. For example, Amazon Pay requires the customer to enter
 * their shipping address using their address book widget. As a result, you may
 * need to provide additional information in order to initialize the shipping
 * step of checkout.
 */
export interface ShippingInitializeOptions<T = {}> extends ShippingRequestOptions<T> {
    /**
     * The options that are required to initialize the shipping step of checkout
     * when using AmazonPayV2.
     */
    amazonpay?: AmazonPayV2ShippingInitializeOptions;

    /**
     * The options that are required to initialize the shipping step of checkout
     * when using Stripe Upe Link.
     */
    stripeupe?: StripeUPEShippingInitializeOptions;

    /**
     * The options that are required to initialize the shipping step of checkout
     * when using Braintree Accelerated Checkout.
     */
    braintreeacceleratedcheckout?: BraintreeAcceleratedCheckoutInitializeOptions;

    /**
     * The options that are required to initialize the shipping step of checkout
     * when using PayPal Fastlane.
     */
    paypalcommercefastlane?: PayPalCommerceFastlaneShippingInitializeOptions;
}
