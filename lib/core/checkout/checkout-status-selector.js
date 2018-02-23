"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CheckoutStatusSelector = (function () {
    function CheckoutStatusSelector(billingAddress, cart, config, countries, coupon, customer, giftCertificate, instruments, order, paymentMethods, quote, remoteCheckout, shipping, shippingAddress, shippingCountries, shippingOptions) {
        this._billingAddress = billingAddress;
        this._cart = cart;
        this._config = config;
        this._countries = countries;
        this._coupon = coupon;
        this._customer = customer;
        this._giftCertificate = giftCertificate;
        this._instruments = instruments;
        this._order = order;
        this._paymentMethods = paymentMethods;
        this._quote = quote;
        this._remoteCheckout = remoteCheckout;
        this._shipping = shipping;
        this._shippingAddress = shippingAddress;
        this._shippingCountries = shippingCountries;
        this._shippingOptions = shippingOptions;
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
        return this._order.isSubmitting();
    };
    CheckoutStatusSelector.prototype.isFinalizingOrder = function () {
        return this._order.isFinalizing();
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
        return this._paymentMethods.isInitializingMethod(methodId) || this._remoteCheckout.isInitializingPayment(methodId);
    };
    CheckoutStatusSelector.prototype.isSigningIn = function () {
        return this._customer.isSigningIn();
    };
    CheckoutStatusSelector.prototype.isSigningOut = function () {
        return this._customer.isSigningOut() || this._remoteCheckout.isSigningOut();
    };
    CheckoutStatusSelector.prototype.isInitializingCustomer = function (methodId) {
        return this._customer.isInitializing(methodId);
    };
    CheckoutStatusSelector.prototype.isLoadingShippingOptions = function () {
        return this._shippingOptions.isLoading();
    };
    CheckoutStatusSelector.prototype.isSelectingShippingOption = function () {
        return this._shippingOptions.isSelecting();
    };
    CheckoutStatusSelector.prototype.isUpdatingBillingAddress = function () {
        return this._billingAddress.isUpdating();
    };
    CheckoutStatusSelector.prototype.isUpdatingShippingAddress = function () {
        return this._shippingAddress.isUpdating();
    };
    CheckoutStatusSelector.prototype.isInitializingShipping = function (methodId) {
        return this._shipping.isInitializing(methodId) || this._remoteCheckout.isInitializingShipping(methodId);
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
    return CheckoutStatusSelector;
}());
exports.default = CheckoutStatusSelector;
//# sourceMappingURL=checkout-status-selector.js.map