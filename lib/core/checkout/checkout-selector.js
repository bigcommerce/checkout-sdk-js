"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CheckoutSelector = (function () {
    function CheckoutSelector(billingAddress, cart, config, countries, customer, instruments, order, paymentMethods, quote, shippingAddress, shippingCountries, shippingOptions, cacheFactory) {
        this._billingAddress = billingAddress;
        this._cart = cart;
        this._config = config;
        this._countries = countries;
        this._customer = customer;
        this._instruments = instruments;
        this._order = order;
        this._paymentMethods = paymentMethods;
        this._quote = quote;
        this._shippingAddress = shippingAddress;
        this._shippingCountries = shippingCountries;
        this._shippingOptions = shippingOptions;
        this._cacheFactory = cacheFactory;
    }
    CheckoutSelector.prototype.getCheckoutMeta = function () {
        return this._cacheFactory.get('getCheckoutMeta')
            .retain(function (orderMeta, quoteMeta, isCartVerified, paymentAuthToken, instrumentsMeta) { return (tslib_1.__assign({}, orderMeta, (quoteMeta && quoteMeta.request), instrumentsMeta, { isCartVerified: isCartVerified,
            paymentAuthToken: paymentAuthToken })); })
            .retrieve(this._order.getOrderMeta(), this._quote.getQuoteMeta(), this._cart.isValid(), this._order.getPaymentAuthToken(), this._instruments.getInstrumentsMeta());
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
        return this._order.isPaymentDataRequired(useStoreCredit);
    };
    CheckoutSelector.prototype.isPaymentDataSubmitted = function (methodId, gatewayId) {
        return this._order.isPaymentDataSubmitted(this.getPaymentMethod(methodId, gatewayId));
    };
    CheckoutSelector.prototype.getInstruments = function (storeId, shopperId) {
        return this._instruments.getInstruments(storeId, shopperId);
    };
    return CheckoutSelector;
}());
exports.default = CheckoutSelector;
//# sourceMappingURL=checkout-selector.js.map