import { Response } from '@bigcommerce/request-sender';

import { BillingAddressRequestSender, BillingAddressUpdateRequestBody } from '../billing';
import { RequestOptions } from '../common/http-request';
import { CustomerCredentials, CustomerRequestSender } from '../customer';
import { CountryRequestSender, CountryResponseBody } from '../geography';
import { InternalOrderRequestBody, InternalOrderResponseBody, Order, OrderRequestSender } from '../order';
import { PaymentMethodsResponseBody, PaymentMethodRequestSender, PaymentMethodResponseBody } from '../payment';
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
        private _billingAddressRequestSender: BillingAddressRequestSender,
        private _countryRequestSender: CountryRequestSender,
        private _customerRequestSender: CustomerRequestSender,
        private _orderRequestSender: OrderRequestSender,
        private _paymentMethodRequestSender: PaymentMethodRequestSender,
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

    loadPaymentMethods(options?: RequestOptions): Promise<Response<PaymentMethodsResponseBody>> {
        return this._paymentMethodRequestSender.loadPaymentMethods(options);
    }

    loadPaymentMethod(methodId: string, options?: RequestOptions): Promise<Response<PaymentMethodResponseBody>> {
        return this._paymentMethodRequestSender.loadPaymentMethod(methodId, options);
    }

    loadCountries(options?: RequestOptions): Promise<Response<CountryResponseBody>> {
        return this._countryRequestSender.loadCountries(options);
    }

    loadShippingCountries(options?: RequestOptions): Promise<Response<CountryResponseBody>> {
        return this._shippingCountryRequestSender.loadCountries(options);
    }

    createBillingAddress(checkoutId: string, address: Partial<BillingAddressUpdateRequestBody>, options?: RequestOptions): Promise<Response<Checkout>> {
        return this._billingAddressRequestSender.createAddress(checkoutId, address, options);
    }

    updateBillingAddress(checkoutId: string, address: Partial<BillingAddressUpdateRequestBody>, options?: RequestOptions): Promise<Response> {
        return this._billingAddressRequestSender.updateAddress(checkoutId, address, options);
    }

    signInCustomer(credentials: CustomerCredentials, options?: RequestOptions): Promise<Response> {
        return this._customerRequestSender.signInCustomer(credentials, options);
    }

    signOutCustomer(options?: RequestOptions): Promise<Response> {
        return this._customerRequestSender.signOutCustomer(options);
    }
}
