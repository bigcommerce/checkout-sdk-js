import { RequestOptions } from '../util-types';

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
    /**
     * The identifier of the payment method.
     */
    methodId?: string;
}
