import { Response } from '@bigcommerce/request-sender';

import { AddressRequestBody } from '../address';
import { BillingAddressRequestSender } from '../billing';
import { CartRequestSender } from '../cart';
import { RequestOptions } from '../common/http-request';
import { Config, ConfigRequestSender } from '../config';
import { CouponRequestSender, GiftCertificateRequestSender } from '../coupon';
import { CustomerCredentials, CustomerRequestSender } from '../customer';
import { CountryRequestSender, CountryResponseBody } from '../geography';
import { InternalOrderResponseBody, Order, OrderParams, OrderRequestBody, OrderRequestSender } from '../order';
import { PaymentMethodsResponseBody, PaymentMethodRequestSender, PaymentMethodResponseBody } from '../payment';
import { QuoteRequestSender } from '../quote';
import {
    ConsignmentsRequestBody,
    ConsignmentRequestBody,
    ConsignmentRequestSender,
    ShippingCountryRequestSender
} from '../shipping';

import Checkout from './checkout';
import CheckoutParams from './checkout-params';
import CheckoutRequestSender from './checkout-request-sender';

// Convert this file into TypeScript properly
// i.e.: Response<T>
export default class CheckoutClient {
    /**
     * @internal
     */
    constructor(
        private _billingAddressRequestSender: BillingAddressRequestSender,
        private _cartRequestSender: CartRequestSender,
        private _checkoutRequestSender: CheckoutRequestSender,
        private _configRequestSender: ConfigRequestSender,
        private _consignmentRequestSender: ConsignmentRequestSender,
        private _countryRequestSender: CountryRequestSender,
        private _couponRequestSender: CouponRequestSender,
        private _customerRequestSender: CustomerRequestSender,
        private _giftCertificateRequestSender: GiftCertificateRequestSender,
        private _orderRequestSender: OrderRequestSender,
        private _paymentMethodRequestSender: PaymentMethodRequestSender,
        private _quoteRequestSender: QuoteRequestSender,
        private _shippingCountryRequestSender: ShippingCountryRequestSender
    ) {}

    loadCheckout(id: string, options?: RequestOptions<CheckoutParams>): Promise<Response> {
        return this._checkoutRequestSender.loadCheckout(id, options);
    }

    loadQuote(options?: RequestOptions): Promise<Response> {
        return this._quoteRequestSender.loadQuote(options);
    }

    loadCart(options?: RequestOptions): Promise<Response> {
        return this._cartRequestSender.loadCart(options);
    }

    loadOrder(orderId: number, options?: RequestOptions<OrderParams>): Promise<Response<Order>> {
        return this._orderRequestSender.loadOrder(orderId, options);
    }

    /**
     * @deprecated
     * Remove once we fully transition to Storefront API
     */
    loadInternalOrder(orderId: number, options?: RequestOptions): Promise<Response<InternalOrderResponseBody>> {
        return this._orderRequestSender.loadInternalOrder(orderId, options);
    }

    submitOrder(body: OrderRequestBody, options?: RequestOptions): Promise<Response<InternalOrderResponseBody>> {
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

    createBillingAddress(checkoutId: string, address: Partial<AddressRequestBody>, options?: RequestOptions): Promise<Response<Checkout>> {
        return this._billingAddressRequestSender.createAddress(checkoutId, address, options);
    }

    updateBillingAddress(checkoutId: string, address: Partial<AddressRequestBody>, options?: RequestOptions): Promise<Response> {
        return this._billingAddressRequestSender.updateAddress(checkoutId, address, options);
    }

    createConsignments(checkoutId: string, consignments: ConsignmentsRequestBody, options?: RequestOptions): Promise<Response> {
        return this._consignmentRequestSender.createConsignments(checkoutId, consignments, options);
    }

    updateConsignment(checkoutId: string, consignment: ConsignmentRequestBody, options?: RequestOptions): Promise<Response> {
        return this._consignmentRequestSender.updateConsignment(checkoutId, consignment, options);
    }

    signInCustomer(credentials: CustomerCredentials, options?: RequestOptions): Promise<Response> {
        return this._customerRequestSender.signInCustomer(credentials, options);
    }

    signOutCustomer(options?: RequestOptions): Promise<Response> {
        return this._customerRequestSender.signOutCustomer(options);
    }

    applyCoupon(checkoutId: string, code: string, options?: RequestOptions): Promise<Response> {
        return this._couponRequestSender.applyCoupon(checkoutId, code, options);
    }

    removeCoupon(checkoutId: string, code: string, options?: RequestOptions): Promise<Response> {
        return this._couponRequestSender.removeCoupon(checkoutId, code, options);
    }

    applyGiftCertificate(checkoutId: string, code: string, options?: RequestOptions): Promise<Response> {
        return this._giftCertificateRequestSender.applyGiftCertificate(checkoutId, code, options);
    }

    removeGiftCertificate(checkoutId: string, code: string, options?: RequestOptions): Promise<Response> {
        return this._giftCertificateRequestSender.removeGiftCertificate(checkoutId, code, options);
    }

    loadConfig(options?: RequestOptions): Promise<Response<Config>> {
        return this._configRequestSender.loadConfig(options);
    }
}
