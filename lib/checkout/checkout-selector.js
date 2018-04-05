"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var selector_1 = require("../common/selector");
var CheckoutSelector = (function () {
    function CheckoutSelector(billingAddress, cart, config, countries, customer, form, instruments, order, paymentMethods, quote, remoteCheckout, shippingAddress, shippingCountries, shippingOptions) {
        this._billingAddress = billingAddress;
        this._cart = cart;
        this._config = config;
        this._countries = countries;
        this._customer = customer;
        this._form = form;
        this._instruments = instruments;
        this._order = order;
        this._paymentMethods = paymentMethods;
        this._quote = quote;
        this._remoteCheckout = remoteCheckout;
        this._shippingAddress = shippingAddress;
        this._shippingCountries = shippingCountries;
        this._shippingOptions = shippingOptions;
    }
    CheckoutSelector.prototype.getCheckoutMeta = function () {
        var orderMeta = this._order.getOrderMeta();
        var quoteMeta = this._quote.getQuoteMeta();
        var isCartVerified = this._cart.isValid();
        var paymentAuthToken = this._order.getPaymentAuthToken();
        var instrumentsMeta = this._instruments.getInstrumentsMeta();
        var remoteCheckout = this._remoteCheckout.getCheckout();
        var remoteCheckoutMeta = this._remoteCheckout.getCheckoutMeta();
        return tslib_1.__assign({}, orderMeta, (quoteMeta && quoteMeta.request), instrumentsMeta, { isCartVerified: isCartVerified,
            paymentAuthToken: paymentAuthToken, remoteCheckout: tslib_1.__assign({}, remoteCheckout, remoteCheckoutMeta) });
    };
    CheckoutSelector.prototype.getOrder = function () {
        return this._order.getOrder();
    };
    CheckoutSelector.prototype.getQuote = function () {
        return this._quote.getQuote();
    };
    CheckoutSelector.prototype.getConfig = function () {
        return this._config.getConfig();
    };
    CheckoutSelector.prototype.getShippingAddress = function () {
        return this._shippingAddress.getShippingAddress();
    };
    CheckoutSelector.prototype.getShippingOptions = function () {
        return this._shippingOptions.getShippingOptions();
    };
    CheckoutSelector.prototype.getSelectedShippingOption = function () {
        return this._shippingOptions.getSelectedShippingOption();
    };
    CheckoutSelector.prototype.getShippingCountries = function () {
        return this._shippingCountries.getShippingCountries();
    };
    CheckoutSelector.prototype.getBillingAddress = function () {
        return this._billingAddress.getBillingAddress();
    };
    CheckoutSelector.prototype.getBillingCountries = function () {
        return this._countries.getCountries();
    };
    CheckoutSelector.prototype.getPaymentMethods = function () {
        return this._paymentMethods.getPaymentMethods();
    };
    CheckoutSelector.prototype.getPaymentMethod = function (methodId, gatewayId) {
        return this._paymentMethods.getPaymentMethod(methodId, gatewayId);
    };
    CheckoutSelector.prototype.getSelectedPaymentMethod = function () {
        return this._paymentMethods.getSelectedPaymentMethod();
    };
    CheckoutSelector.prototype.getCart = function () {
        return this._cart.getCart();
    };
    CheckoutSelector.prototype.getCustomer = function () {
        return this._customer.getCustomer();
    };
    CheckoutSelector.prototype.isPaymentDataRequired = function (useStoreCredit) {
        if (useStoreCredit === void 0) { useStoreCredit = false; }
        return this._order.isPaymentDataRequired(useStoreCredit);
    };
    CheckoutSelector.prototype.isPaymentDataSubmitted = function (methodId, gatewayId) {
        return this._order.isPaymentDataSubmitted(this.getPaymentMethod(methodId, gatewayId));
    };
    CheckoutSelector.prototype.getInstruments = function () {
        return this._instruments.getInstruments();
    };
    CheckoutSelector.prototype.getBillingAddressFields = function (countryCode) {
        return this._form.getBillingAddressFields(this.getBillingCountries(), countryCode);
    };
    CheckoutSelector.prototype.getShippingAddressFields = function (countryCode) {
        return this._form.getShippingAddressFields(this.getShippingCountries(), countryCode);
    };
    CheckoutSelector = tslib_1.__decorate([
        selector_1.selectorDecorator
    ], CheckoutSelector);
    return CheckoutSelector;
}());
exports.default = CheckoutSelector;
//# sourceMappingURL=checkout-selector.js.map