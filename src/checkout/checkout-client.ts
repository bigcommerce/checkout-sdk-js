import { Response } from '@bigcommerce/request-sender';

import { BillingAddressRequestSender, BillingAddressUpdateRequestBody } from '../billing';
import { RequestOptions } from '../common/http-request';
import { CustomerCredentials, CustomerRequestSender } from '../customer';
import { CountryRequestSender, CountryResponseBody } from '../geography';
import { InternalOrderRequestBody, InternalOrderResponseBody, Order, OrderRequestSender } from '../order';
import { ShippingCountryRequestSender } from '../shipping';

import Checkout from './checkout';

/**
 * @deprecated Use request senders directly
 */
export default class CheckoutClient {
    /**
     * @internal
     */
    constructor(
        private _customerRequestSender: CustomerRequestSender,
        private _orderRequestSender: OrderRequestSender,
        private _shippingCountryRequestSender: ShippingCountryRequestSender
    ) {}

    loadOrder(orderId: number, options?: RequestOptions): Promise<Response<Order>> {
        return this._orderRequestSender.loadOrder(orderId, options);
    }

    submitOrder(body: InternalOrderRequestBody, options?: RequestOptions): Promise<Response<InternalOrderResponseBody>> {
        return this._orderRequestSender.submitOrder(body, options);
    }

    finalizeOrder(orderId: number, options?: RequestOptions): Promise<Response<InternalOrderResponseBody>> {
        return this._orderRequestSender.finalizeOrder(orderId, options);
    }

    loadShippingCountries(options?: RequestOptions): Promise<Response<CountryResponseBody>> {
        return this._shippingCountryRequestSender.loadCountries(options);
    }

    signInCustomer(credentials: CustomerCredentials, options?: RequestOptions): Promise<Response> {
        return this._customerRequestSender.signInCustomer(credentials, options);
    }

    signOutCustomer(options?: RequestOptions): Promise<Response> {
        return this._customerRequestSender.signOutCustomer(options);
    }
}
