"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var CheckoutSelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {BillingAddressSelector} billingAddress
     * @param {CartSelector} cart
     * @param {ConfigSelector} config
     * @param {CountrySelector} countries
     * @param {CustomerSelector} customer
     * @param {InstrumentSelector} instruments
     * @param {OrderSelector} order
     * @param {PaymentMethodSelector} paymentMethods
     * @param {QuoteSelector} quote
     * @param {ShippingAddressSelector} shippingAddress
     * @param {ShippingCountrySelector} shippingCountries
     * @param {ShippingOptionSelector} shippingOptions
     */
    function CheckoutSelector(billingAddress, cart, config, countries, customer, instruments, order, paymentMethods, quote, shippingAddress, shippingCountries, shippingOptions) {
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
    }
    /**
     * @return {CheckoutMeta}
     */
    CheckoutSelector.prototype.getCheckoutMeta = function () {
        return tslib_1.__assign({}, this._order.getOrderMeta(), this._quote.getQuoteMeta().request, { isCartVerified: this._cart.isValid(), paymentAuthToken: this._order.getPaymentAuthToken() });
    };
    /**
     * @return {Order}
     */
    CheckoutSelector.prototype.getOrder = function () {
        return this._order.getOrder();
    };
    /**
     * @return {Order}
     */
    CheckoutSelector.prototype.getQuote = function () {
        return this._quote.getQuote();
    };
    /**
     * @return {Config}
     */
    CheckoutSelector.prototype.getConfig = function () {
        return this._config.getConfig();
    };
    /**
     * @return {Address}
     */
    CheckoutSelector.prototype.getShippingAddress = function () {
        return this._shippingAddress.getShippingAddress();
    };
    /**
     * @return {ShippingOptionList}
     */
    CheckoutSelector.prototype.getShippingOptions = function () {
        return this._shippingOptions.getShippingOptions();
    };
    /**
     * @return {?ShippingOption}
     */
    CheckoutSelector.prototype.getSelectedShippingOption = function () {
        return this._shippingOptions.getSelectedShippingOption();
    };
    /**
     * @return {Country[]}
     */
    CheckoutSelector.prototype.getShippingCountries = function () {
        return this._shippingCountries.getShippingCountries();
    };
    /**
     * @return {Address}
     */
    CheckoutSelector.prototype.getBillingAddress = function () {
        return this._billingAddress.getBillingAddress();
    };
    /**
     * @return {Country[]}
     */
    CheckoutSelector.prototype.getBillingCountries = function () {
        return this._countries.getCountries();
    };
    /**
     * @return {PaymentMethod[]}
     */
    CheckoutSelector.prototype.getPaymentMethods = function () {
        return this._paymentMethods.getPaymentMethods();
    };
    /**
     * @param {string} methodId
     * @param {string} [gatewayId]
     * @return {?PaymentMethod}
     */
    CheckoutSelector.prototype.getPaymentMethod = function (methodId, gatewayId) {
        return this._paymentMethods.getPaymentMethod(methodId, gatewayId);
    };
    /**
     * @return {?PaymentMethod}
     */
    CheckoutSelector.prototype.getSelectedPaymentMethod = function () {
        return this._paymentMethods.getSelectedPaymentMethod();
    };
    /**
     * @return {Cart}
     */
    CheckoutSelector.prototype.getCart = function () {
        return this._cart.getCart();
    };
    /**
     * @return {Customer}
     */
    CheckoutSelector.prototype.getCustomer = function () {
        return this._customer.getCustomer();
    };
    /**
     * @param {boolean} useStoreCredit
     * @return {boolean}
     */
    CheckoutSelector.prototype.isPaymentDataRequired = function (useStoreCredit) {
        return this._order.isPaymentDataRequired(useStoreCredit);
    };
    /**
     * @param {string} methodId
     * @param {string} [gatewayId]
     * @return {boolean}
     */
    CheckoutSelector.prototype.isPaymentDataSubmitted = function (methodId, gatewayId) {
        return this._order.isPaymentDataSubmitted(this.getPaymentMethod(methodId, gatewayId));
    };
    /**
     * @param {string} storeId
     * @param {string} shopperId
     * @return {Instrument[]}
     */
    CheckoutSelector.prototype.getInstruments = function (storeId, shopperId) {
        return this._instruments.getInstruments(storeId, shopperId);
    };
    return CheckoutSelector;
}());
exports.default = CheckoutSelector;
//# sourceMappingURL=checkout-selector.js.map