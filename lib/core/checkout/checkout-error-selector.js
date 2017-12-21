"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CheckoutErrorSelector = /** @class */ (function () {
    /**
     * @constructor
     * @param {BillingAddressSelector} billingAddress
     * @param {CartSelector} cart
     * @param {CountrySelector} countries
     * @param {CouponSelector} coupon
     * @param {CustomerSelector} customer
     * @param {OrderSelector} order
     * @param {PaymentMethodSelector} paymentMethods
     * @param {QuoteSelector} quote
     * @param {ShippingAddressSelector} shippingAddress
     * @param {ShippingCountrySelector} shippingCountries
     * @param {ShippingOptionSelector} shippingOptions
     */
    function CheckoutErrorSelector(billingAddress, cart, countries, coupon, customer, giftCertificate, order, paymentMethods, quote, shippingAddress, shippingCountries, shippingOptions) {
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
     * @return {?ErrorResponse}
     */
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
            this.getLoadShippingOptionsError() ||
            this.getSelectShippingOptionError() ||
            this.getSignInError() ||
            this.getSignOutError() ||
            this.getUpdateBillingAddressError() ||
            this.getUpdateShippingAddressError() ||
            this.getApplyCouponError() ||
            this.getRemoveCouponError() ||
            this.getApplyGiftCertificateError() ||
            this.getRemoveGiftCertificateError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getLoadCheckoutError = function () {
        return this._quote.getLoadError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getSubmitOrderError = function () {
        return this._order.getSubmitError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getFinalizeOrderError = function () {
        return this._order.getFinalizeError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getLoadOrderError = function () {
        return this._order.getLoadError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getLoadCartError = function () {
        return this._cart.getLoadError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getVerifyCartError = function () {
        return this._cart.getVerifyError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getLoadBillingCountriesError = function () {
        return this._countries.getLoadError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getLoadShippingCountriesError = function () {
        return this._shippingCountries.getLoadError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getLoadPaymentMethodsError = function () {
        return this._paymentMethods.getLoadError();
    };
    /**
     * @param {string} methodId
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getLoadPaymentMethodError = function (methodId) {
        return this._paymentMethods.getLoadMethodError(methodId);
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getSignInError = function () {
        return this._customer.getSignInError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getSignOutError = function () {
        return this._customer.getSignOutError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getLoadShippingOptionsError = function () {
        return this._shippingOptions.getLoadError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getSelectShippingOptionError = function () {
        return this._shippingOptions.getSelectError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getUpdateBillingAddressError = function () {
        return this._billingAddress.getUpdateError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getUpdateShippingAddressError = function () {
        return this._shippingAddress.getUpdateError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getApplyCouponError = function () {
        return this._coupon.getApplyError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getRemoveCouponError = function () {
        return this._coupon.getRemoveError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getApplyGiftCertificateError = function () {
        return this._giftCertificate.getApplyError();
    };
    /**
     * @return {?ErrorResponse}
     */
    CheckoutErrorSelector.prototype.getRemoveGiftCertificateError = function () {
        return this._giftCertificate.getRemoveError();
    };
    return CheckoutErrorSelector;
}());
exports.default = CheckoutErrorSelector;
//# sourceMappingURL=checkout-error-selector.js.map