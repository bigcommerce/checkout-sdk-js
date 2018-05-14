import { Response } from '@bigcommerce/request-sender';

import { InternalAddress } from '../address';
import { BillingAddressRequestSender } from '../billing';
import { CartRequestSender } from '../cart';
import { RequestOptions } from '../common/http-request';
import { ConfigRequestSender } from '../config';
import { CouponRequestSender, GiftCertificateRequestSender } from '../coupon';
import { CustomerCredentials, CustomerRequestSender } from '../customer';
import { CountryRequestSender } from '../geography';
import { OrderRequestBody, OrderRequestSender } from '../order';
import { PaymentMethodRequestSender } from '../payment';
import { QuoteRequestSender } from '../quote';
import { ShippingAddressRequestSender, ShippingCountryRequestSender, ShippingOptionRequestSender } from '../shipping';

/**
 * @deprecated Use request senders directly
 */
export default class CheckoutClient {
    /**
     * @internal
     */
    constructor(
        private _billingAddressRequestSender: BillingAddressRequestSender,
        private _cartRequestSender: CartRequestSender,
        private _configRequestSender: ConfigRequestSender,
        private _countryRequestSender: CountryRequestSender,
        private _couponRequestSender: CouponRequestSender,
        private _customerRequestSender: CustomerRequestSender,
        private _giftCertificateRequestSender: GiftCertificateRequestSender,
        private _orderRequestSender: OrderRequestSender,
        private _paymentMethodRequestSender: PaymentMethodRequestSender,
        private _quoteRequestSender: QuoteRequestSender,
        private _shippingAddressRequestSender: ShippingAddressRequestSender,
        private _shippingCountryRequestSender: ShippingCountryRequestSender,
        private _shippingOptionRequestSender: ShippingOptionRequestSender
    ) {}

    loadCheckout(options?: RequestOptions): Promise<Response> {
        return this._quoteRequestSender.loadQuote(options);
    }

    loadCart(options?: RequestOptions): Promise<Response> {
        return this._cartRequestSender.loadCart(options);
    }

    loadOrder(orderId: number, options?: RequestOptions): Promise<Response> {
        return this._orderRequestSender.loadOrder(orderId, options);
    }

    submitOrder(body: OrderRequestBody, options?: RequestOptions): Promise<Response> {
        return this._orderRequestSender.submitOrder(body, options);
    }

    finalizeOrder(orderId: number, options?: RequestOptions): Promise<Response> {
        return this._orderRequestSender.finalizeOrder(orderId, options);
    }

    loadPaymentMethods(options?: RequestOptions): Promise<Response> {
        return this._paymentMethodRequestSender.loadPaymentMethods(options);
    }

    loadPaymentMethod(methodId: string, options?: RequestOptions): Promise<Response> {
        return this._paymentMethodRequestSender.loadPaymentMethod(methodId, options);
    }

    loadCountries(options?: RequestOptions): Promise<Response> {
        return this._countryRequestSender.loadCountries(options);
    }

    loadShippingCountries(options?: RequestOptions): Promise<Response> {
        return this._shippingCountryRequestSender.loadCountries(options);
    }

    updateBillingAddress(address: InternalAddress, options?: RequestOptions): Promise<Response> {
        return this._billingAddressRequestSender.updateAddress(address, options);
    }

    updateShippingAddress(address: InternalAddress, options?: RequestOptions): Promise<Response> {
        return this._shippingAddressRequestSender.updateAddress(address, options);
    }

    loadShippingOptions(options?: RequestOptions): Promise<Response> {
        return this._shippingOptionRequestSender.loadShippingOptions(options);
    }

    selectShippingOption(addressId: string, shippingOptionId: string, options?: RequestOptions): Promise<Response> {
        return this._shippingOptionRequestSender.selectShippingOption(addressId, shippingOptionId, options);
    }

    signInCustomer(credentials: CustomerCredentials, options?: RequestOptions): Promise<Response> {
        return this._customerRequestSender.signInCustomer(credentials, options);
    }

    signOutCustomer(options?: RequestOptions): Promise<Response> {
        return this._customerRequestSender.signOutCustomer(options);
    }

    applyCoupon(code: string, options?: RequestOptions): Promise<Response> {
        return this._couponRequestSender.applyCoupon(code, options);
    }

    removeCoupon(code: string, options?: RequestOptions): Promise<Response> {
        return this._couponRequestSender.removeCoupon(code, options);
    }

    applyGiftCertificate(code: string, options?: RequestOptions): Promise<Response> {
        return this._giftCertificateRequestSender.applyGiftCertificate(code, options);
    }

    removeGiftCertificate(code: string, options?: RequestOptions): Promise<Response> {
        return this._giftCertificateRequestSender.removeGiftCertificate(code, options);
    }

    loadConfig(options?: RequestOptions): Promise<Response> {
        return this._configRequestSender.loadConfig(options);
    }
}
