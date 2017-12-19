"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CheckoutStatusSelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {BillingAddressSelector} billingAddress
     * @param {CartSelector} cart
     * @param {CountrySelector} countries
     * @param {CouponSelector} coupon
     * @param {CustomerSelector} customer
     * @param {GiftCertificateSelector} giftCertificate
     * @param {OrderSelector} order
     * @param {PaymentMethodSelector} paymentMethods
     * @param {QuoteSelector} quote
     * @param {ShippingAddressSelector} shippingAddress
     * @param {ShippingCountrySelector} shippingCountries
     * @param {ShippingOptionSelector} shippingOptions
     */
    function CheckoutStatusSelector(billingAddress, cart, countries, coupon, customer, giftCertificate, order, paymentMethods, quote, shippingAddress, shippingCountries, shippingOptions) {
        this._billingAddress = billingAddress;
        this._cart = cart;
        this._countries = countries;
        this._coupon = coupon;
        this._customer = customer;
        this._giftCertificate = giftCertificate;
        this._order = order;
        this._paymentMethods = paymentMethods;
        this._quote = quote;
        this._shippingAddress = shippingAddress;
        this._shippingCountries = shippingCountries;
        this._shippingOptions = shippingOptions;
    }
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isPending = function () {
        return this.isLoadingQuote() ||
            this.isSubmittingOrder() ||
            this.isFinalizingOrder() ||
            this.isLoadingOrder() ||
            this.isLoadingCart() ||
            this.isVerifyingCart() ||
            this.isLoadingBillingCountries() ||
            this.isLoadingShippingCountries() ||
            this.isLoadingPaymentMethods() ||
            this.isLoadingPaymentMethod() ||
            this.isLoadingShippingOptions() ||
            this.isSelectingShippingOption() ||
            this.isSigningIn() ||
            this.isSigningOut() ||
            this.isUpdatingBillingAddress() ||
            this.isUpdatingShippingAddress() ||
            this.isApplyingCoupon() ||
            this.isRemovingCoupon() ||
            this.isApplyingGiftCertificate() ||
            this.isRemovingGiftCertificate();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isLoadingQuote = function () {
        return this._quote.isLoading();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isSubmittingOrder = function () {
        return this._order.isSubmitting();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isFinalizingOrder = function () {
        return this._order.isFinalizing();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isLoadingOrder = function () {
        return this._order.isLoading();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isLoadingCart = function () {
        return this._cart.isLoading();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isVerifyingCart = function () {
        return this._cart.isVerifying();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isLoadingBillingCountries = function () {
        return this._countries.isLoading();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isLoadingShippingCountries = function () {
        return this._shippingCountries.isLoading();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isLoadingPaymentMethods = function () {
        return this._paymentMethods.isLoading();
    };
    /**
     * @param {string} methodId
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isLoadingPaymentMethod = function (methodId) {
        return this._paymentMethods.isLoadingMethod(methodId);
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isSigningIn = function () {
        return this._customer.isSigningIn();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isSigningOut = function () {
        return this._customer.isSigningOut();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isLoadingShippingOptions = function () {
        return this._shippingOptions.isLoading();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isSelectingShippingOption = function () {
        return this._shippingOptions.isSelecting();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isUpdatingBillingAddress = function () {
        return this._billingAddress.isUpdating();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isUpdatingShippingAddress = function () {
        return this._shippingAddress.isUpdating();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isApplyingCoupon = function () {
        return this._coupon.isApplying();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isRemovingCoupon = function () {
        return this._coupon.isRemoving();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isApplyingGiftCertificate = function () {
        return this._giftCertificate.isApplying();
    };
    /**
     * @return {boolean}
     */
    CheckoutStatusSelector.prototype.isRemovingGiftCertificate = function () {
        return this._giftCertificate.isRemoving();
    };
    return CheckoutStatusSelector;
}());
exports.default = CheckoutStatusSelector;
//# sourceMappingURL=checkout-status-selector.js.map