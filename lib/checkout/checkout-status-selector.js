"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var selector_1 = require("../common/selector");
var CheckoutStatusSelector = (function () {
    function CheckoutStatusSelector(billingAddress, cart, config, countries, coupon, customer, customerStrategy, giftCertificate, instruments, order, paymentMethods, paymentStrategy, quote, remoteCheckout, shippingAddress, shippingCountries, shippingOptions, shippingStrategy) {
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
    CheckoutStatusSelector.prototype.isPending = function () {
        return this.isLoadingCheckout() ||
            this.isSubmittingOrder() ||
            this.isFinalizingOrder() ||
            this.isLoadingOrder() ||
            this.isLoadingCart() ||
            this.isVerifyingCart() ||
            this.isLoadingBillingCountries() ||
            this.isLoadingShippingCountries() ||
            this.isLoadingPaymentMethods() ||
            this.isLoadingPaymentMethod() ||
            this.isInitializingPaymentMethod() ||
            this.isLoadingShippingOptions() ||
            this.isSelectingShippingOption() ||
            this.isSigningIn() ||
            this.isSigningOut() ||
            this.isInitializingCustomer() ||
            this.isUpdatingBillingAddress() ||
            this.isUpdatingShippingAddress() ||
            this.isInitializingShipping() ||
            this.isApplyingCoupon() ||
            this.isRemovingCoupon() ||
            this.isApplyingGiftCertificate() ||
            this.isRemovingGiftCertificate() ||
            this.isLoadingInstruments() ||
            this.isVaultingInstrument() ||
            this.isDeletingInstrument() ||
            this.isLoadingConfig();
    };
    CheckoutStatusSelector.prototype.isLoadingCheckout = function () {
        return this._quote.isLoading();
    };
    CheckoutStatusSelector.prototype.isSubmittingOrder = function () {
        return this._paymentStrategy.isExecuting();
    };
    CheckoutStatusSelector.prototype.isFinalizingOrder = function () {
        return this._paymentStrategy.isFinalizing();
    };
    CheckoutStatusSelector.prototype.isLoadingOrder = function () {
        return this._order.isLoading();
    };
    CheckoutStatusSelector.prototype.isLoadingCart = function () {
        return this._cart.isLoading();
    };
    CheckoutStatusSelector.prototype.isVerifyingCart = function () {
        return this._cart.isVerifying();
    };
    CheckoutStatusSelector.prototype.isLoadingBillingCountries = function () {
        return this._countries.isLoading();
    };
    CheckoutStatusSelector.prototype.isLoadingShippingCountries = function () {
        return this._shippingCountries.isLoading();
    };
    CheckoutStatusSelector.prototype.isLoadingPaymentMethods = function () {
        return this._paymentMethods.isLoading();
    };
    CheckoutStatusSelector.prototype.isLoadingPaymentMethod = function (methodId) {
        return this._paymentMethods.isLoadingMethod(methodId);
    };
    CheckoutStatusSelector.prototype.isInitializingPaymentMethod = function (methodId) {
        return this._paymentStrategy.isInitializing(methodId);
    };
    CheckoutStatusSelector.prototype.isSigningIn = function (methodId) {
        return this._customerStrategy.isSigningIn(methodId);
    };
    CheckoutStatusSelector.prototype.isSigningOut = function (methodId) {
        return this._customerStrategy.isSigningOut(methodId);
    };
    CheckoutStatusSelector.prototype.isInitializingCustomer = function (methodId) {
        return this._customerStrategy.isInitializing(methodId);
    };
    CheckoutStatusSelector.prototype.isLoadingShippingOptions = function () {
        return this._shippingOptions.isLoading();
    };
    CheckoutStatusSelector.prototype.isSelectingShippingOption = function () {
        return this._shippingStrategy.isSelectingOption();
    };
    CheckoutStatusSelector.prototype.isUpdatingBillingAddress = function () {
        return this._billingAddress.isUpdating();
    };
    CheckoutStatusSelector.prototype.isUpdatingShippingAddress = function () {
        return this._shippingStrategy.isUpdatingAddress();
    };
    CheckoutStatusSelector.prototype.isInitializingShipping = function (methodId) {
        return this._shippingStrategy.isInitializing(methodId);
    };
    CheckoutStatusSelector.prototype.isApplyingCoupon = function () {
        return this._coupon.isApplying();
    };
    CheckoutStatusSelector.prototype.isRemovingCoupon = function () {
        return this._coupon.isRemoving();
    };
    CheckoutStatusSelector.prototype.isApplyingGiftCertificate = function () {
        return this._giftCertificate.isApplying();
    };
    CheckoutStatusSelector.prototype.isRemovingGiftCertificate = function () {
        return this._giftCertificate.isRemoving();
    };
    CheckoutStatusSelector.prototype.isLoadingInstruments = function () {
        return this._instruments.isLoading();
    };
    CheckoutStatusSelector.prototype.isVaultingInstrument = function () {
        return this._instruments.isVaulting();
    };
    CheckoutStatusSelector.prototype.isDeletingInstrument = function (instrumentId) {
        return this._instruments.isDeleting(instrumentId);
    };
    CheckoutStatusSelector.prototype.isLoadingConfig = function () {
        return this._config.isLoading();
    };
    CheckoutStatusSelector = tslib_1.__decorate([
        selector_1.selectorDecorator
    ], CheckoutStatusSelector);
    return CheckoutStatusSelector;
}());
exports.default = CheckoutStatusSelector;
//# sourceMappingURL=checkout-status-selector.js.map