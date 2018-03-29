"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var selector_1 = require("../common/selector");
var CheckoutErrorSelector = (function () {
    function CheckoutErrorSelector(billingAddress, cart, config, countries, coupon, customer, customerStrategy, giftCertificate, instruments, order, paymentMethods, paymentStrategy, quote, remoteCheckout, shippingAddress, shippingCountries, shippingOptions, shippingStrategy) {
        this._billingAddress = billingAddress;
        this._cart = cart;
        this._config = config;
        this._countries = countries;
        this._coupon = coupon;
        this._customer = customer;
        this._customerStrategy = customerStrategy;
        this._giftCertificate = giftCertificate;
        this._instruments = instruments;
        this._order = order;
        this._paymentMethods = paymentMethods;
        this._paymentStrategy = paymentStrategy;
        this._quote = quote;
        this._remoteCheckout = remoteCheckout;
        this._shippingAddress = shippingAddress;
        this._shippingCountries = shippingCountries;
        this._shippingOptions = shippingOptions;
        this._shippingStrategy = shippingStrategy;
    }
    CheckoutErrorSelector.prototype.getError = function () {
        return this.getLoadCheckoutError() ||
            this.getSubmitOrderError() ||
            this.getFinalizeOrderError() ||
            this.getLoadOrderError() ||
            this.getLoadCartError() ||
            this.getVerifyCartError() ||
            this.getLoadBillingCountriesError() ||
            this.getLoadShippingCountriesError() ||
            this.getLoadPaymentMethodsError() ||
            this.getLoadPaymentMethodError() ||
            this.getInitializePaymentMethodError() ||
            this.getLoadShippingOptionsError() ||
            this.getSelectShippingOptionError() ||
            this.getSignInError() ||
            this.getSignOutError() ||
            this.getInitializeCustomerError() ||
            this.getUpdateBillingAddressError() ||
            this.getUpdateShippingAddressError() ||
            this.getInitializeShippingError() ||
            this.getApplyCouponError() ||
            this.getRemoveCouponError() ||
            this.getApplyGiftCertificateError() ||
            this.getRemoveGiftCertificateError() ||
            this.getLoadInstrumentsError() ||
            this.getDeleteInstrumentError() ||
            this.getVaultInstrumentError() ||
            this.getLoadConfigError();
    };
    CheckoutErrorSelector.prototype.getLoadCheckoutError = function () {
        return this._quote.getLoadError();
    };
    CheckoutErrorSelector.prototype.getSubmitOrderError = function () {
        return this._paymentStrategy.getExecuteError();
    };
    CheckoutErrorSelector.prototype.getFinalizeOrderError = function () {
        return this._paymentStrategy.getFinalizeError();
    };
    CheckoutErrorSelector.prototype.getLoadOrderError = function () {
        return this._order.getLoadError();
    };
    CheckoutErrorSelector.prototype.getLoadCartError = function () {
        return this._cart.getLoadError();
    };
    CheckoutErrorSelector.prototype.getVerifyCartError = function () {
        return this._cart.getVerifyError();
    };
    CheckoutErrorSelector.prototype.getLoadBillingCountriesError = function () {
        return this._countries.getLoadError();
    };
    CheckoutErrorSelector.prototype.getLoadShippingCountriesError = function () {
        return this._shippingCountries.getLoadError();
    };
    CheckoutErrorSelector.prototype.getLoadPaymentMethodsError = function () {
        return this._paymentMethods.getLoadError();
    };
    CheckoutErrorSelector.prototype.getLoadPaymentMethodError = function (methodId) {
        return this._paymentMethods.getLoadMethodError(methodId);
    };
    CheckoutErrorSelector.prototype.getInitializePaymentMethodError = function (methodId) {
        return this._paymentStrategy.getInitializeError(methodId);
    };
    CheckoutErrorSelector.prototype.getSignInError = function () {
        return this._customerStrategy.getSignInError();
    };
    CheckoutErrorSelector.prototype.getSignOutError = function () {
        return this._customerStrategy.getSignOutError();
    };
    CheckoutErrorSelector.prototype.getInitializeCustomerError = function (methodId) {
        return this._customerStrategy.getInitializeError(methodId);
    };
    CheckoutErrorSelector.prototype.getLoadShippingOptionsError = function () {
        return this._shippingOptions.getLoadError();
    };
    CheckoutErrorSelector.prototype.getSelectShippingOptionError = function () {
        return this._shippingStrategy.getSelectOptionError();
    };
    CheckoutErrorSelector.prototype.getUpdateBillingAddressError = function () {
        return this._billingAddress.getUpdateError();
    };
    CheckoutErrorSelector.prototype.getUpdateShippingAddressError = function () {
        return this._shippingStrategy.getUpdateAddressError();
    };
    CheckoutErrorSelector.prototype.getInitializeShippingError = function (methodId) {
        return this._shippingStrategy.getInitializeError(methodId);
    };
    CheckoutErrorSelector.prototype.getApplyCouponError = function () {
        return this._coupon.getApplyError();
    };
    CheckoutErrorSelector.prototype.getRemoveCouponError = function () {
        return this._coupon.getRemoveError();
    };
    CheckoutErrorSelector.prototype.getApplyGiftCertificateError = function () {
        return this._giftCertificate.getApplyError();
    };
    CheckoutErrorSelector.prototype.getRemoveGiftCertificateError = function () {
        return this._giftCertificate.getRemoveError();
    };
    CheckoutErrorSelector.prototype.getLoadInstrumentsError = function () {
        return this._instruments.getLoadError();
    };
    CheckoutErrorSelector.prototype.getVaultInstrumentError = function () {
        return this._instruments.getVaultError();
    };
    CheckoutErrorSelector.prototype.getDeleteInstrumentError = function (instrumentId) {
        return this._instruments.getDeleteError(instrumentId);
    };
    CheckoutErrorSelector.prototype.getLoadConfigError = function () {
        return this._config.getLoadError();
    };
    CheckoutErrorSelector = tslib_1.__decorate([
        selector_1.selectorDecorator
    ], CheckoutErrorSelector);
    return CheckoutErrorSelector;
}());
exports.default = CheckoutErrorSelector;
//# sourceMappingURL=checkout-error-selector.js.map