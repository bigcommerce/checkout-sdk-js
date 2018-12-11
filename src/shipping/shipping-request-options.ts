import { RequestOptions } from '../common/http-request';

import { AmazonPayShippingInitializeOptions } from './strategies/amazon';

/**
 * A set of options for configuring any requests related to the shipping step of
 * the current checkout flow.
 *
 * Some payment methods have their own shipping configuration flow. Therefore,
 * you need to specify the method you intend to use if you want to trigger a
 * specific flow for setting the shipping address or option. Otherwise, these
 * options are not required.
 */
export interface ShippingRequestOptions extends RequestOptions {
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
export interface ShippingInitializeOptions extends ShippingRequestOptions {
    /**
     * The options that are required to initialize the shipping step of checkout
     * when using Amazon Pay.
     */
    amazon?: AmazonPayShippingInitializeOptions;
}
