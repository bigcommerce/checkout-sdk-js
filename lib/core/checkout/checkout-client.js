"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CheckoutClient = (function () {
    function CheckoutClient(billingAddressRequestSender, cartRequestSender, countryRequestSender, couponRequestSender, customerRequestSender, giftCertificateRequestSender, orderRequestSender, paymentMethodRequestSender, quoteRequestSender, shippingAddressRequestSender, shippingCountryRequestSender, shippingOptionRequestSender) {
        this._billingAddressRequestSender = billingAddressRequestSender;
        this._cartRequestSender = cartRequestSender;
        this._countryRequestSender = countryRequestSender;
        this._couponRequestSender = couponRequestSender;
        this._customerRequestSender = customerRequestSender;
        this._giftCertificateRequestSender = giftCertificateRequestSender;
        this._orderRequestSender = orderRequestSender;
        this._paymentMethodRequestSender = paymentMethodRequestSender;
        this._quoteRequestSender = quoteRequestSender;
        this._shippingAddressRequestSender = shippingAddressRequestSender;
        this._shippingCountryRequestSender = shippingCountryRequestSender;
        this._shippingOptionRequestSender = shippingOptionRequestSender;
    }
    CheckoutClient.prototype.loadCheckout = function (options) {
        return this._quoteRequestSender.loadQuote(options);
    };
    CheckoutClient.prototype.loadCart = function (options) {
        return this._cartRequestSender.loadCart(options);
    };
    CheckoutClient.prototype.loadOrder = function (orderId, options) {
        return this._orderRequestSender.loadOrder(orderId, options);
    };
    CheckoutClient.prototype.submitOrder = function (body, options) {
        return this._orderRequestSender.submitOrder(body, options);
    };
    CheckoutClient.prototype.finalizeOrder = function (orderId, options) {
        return this._orderRequestSender.finalizeOrder(orderId, options);
    };
    CheckoutClient.prototype.loadPaymentMethods = function (options) {
        return this._paymentMethodRequestSender.loadPaymentMethods(options);
    };
    CheckoutClient.prototype.loadPaymentMethod = function (methodId, options) {
        return this._paymentMethodRequestSender.loadPaymentMethod(methodId, options);
    };
    CheckoutClient.prototype.loadCountries = function (options) {
        return this._countryRequestSender.loadCountries(options);
    };
    CheckoutClient.prototype.loadShippingCountries = function (options) {
        return this._shippingCountryRequestSender.loadCountries(options);
    };
    CheckoutClient.prototype.updateBillingAddress = function (address, options) {
        return this._billingAddressRequestSender.updateAddress(address, options);
    };
    CheckoutClient.prototype.updateShippingAddress = function (address, options) {
        return this._shippingAddressRequestSender.updateAddress(address, options);
    };
    CheckoutClient.prototype.loadShippingOptions = function (options) {
        return this._shippingOptionRequestSender.loadShippingOptions(options);
    };
    CheckoutClient.prototype.selectShippingOption = function (addressId, shippingOptionId, options) {
        return this._shippingOptionRequestSender.selectShippingOption(addressId, shippingOptionId, options);
    };
    CheckoutClient.prototype.signInCustomer = function (credentials, options) {
        return this._customerRequestSender.signInCustomer(credentials, options);
    };
    CheckoutClient.prototype.signOutCustomer = function (options) {
        return this._customerRequestSender.signOutCustomer(options);
    };
    CheckoutClient.prototype.applyCoupon = function (code, options) {
        return this._couponRequestSender.applyCoupon(code, options);
    };
    CheckoutClient.prototype.removeCoupon = function (code, options) {
        return this._couponRequestSender.removeCoupon(code, options);
    };
    CheckoutClient.prototype.applyGiftCertificate = function (code, options) {
        return this._giftCertificateRequestSender.applyGiftCertificate(code, options);
    };
    CheckoutClient.prototype.removeGiftCertificate = function (code, options) {
        return this._giftCertificateRequestSender.removeGiftCertificate(code, options);
    };
    return CheckoutClient;
}());
exports.default = CheckoutClient;
//# sourceMappingURL=checkout-client.js.map