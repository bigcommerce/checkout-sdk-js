export default class CheckoutErrorSelector {
    /**
     * @constructor
     * @param {BillingAddressSelector} billingAddress
     * @param {CartSelector} cart
     * @param {CountrySelector} countries
     * @param {CouponSelector} coupon
     * @param {CustomerSelector} customer
     * @param {GiftCertificateSelector} giftCertificate
     * @param {InstrumentSelector} instrument
     * @param {OrderSelector} order
     * @param {PaymentMethodSelector} paymentMethods
     * @param {QuoteSelector} quote
     * @param {ShippingAddressSelector} shippingAddress
     * @param {ShippingCountrySelector} shippingCountries
     * @param {ShippingOptionSelector} shippingOptions
     */
    constructor(
        billingAddress,
        cart,
        countries,
        coupon,
        customer,
        giftCertificate,
        instrument,
        order,
        paymentMethods,
        quote,
        shippingAddress,
        shippingCountries,
        shippingOptions
    ) {
        this._billingAddress = billingAddress;
        this._cart = cart;
        this._countries = countries;
        this._coupon = coupon;
        this._customer = customer;
        this._giftCertificate = giftCertificate;
        this._instrument = instrument;
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
    getError() {
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
            this.getRemoveGiftCertificateError() ||
            this.getLoadInstrumentsError() ||
            this.getDeleteInstrumentError() ||
            this.getVaultInstrumentError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadCheckoutError() {
        return this._quote.getLoadError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getSubmitOrderError() {
        return this._order.getSubmitError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getFinalizeOrderError() {
        return this._order.getFinalizeError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadOrderError() {
        return this._order.getLoadError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadCartError() {
        return this._cart.getLoadError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getVerifyCartError() {
        return this._cart.getVerifyError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadBillingCountriesError() {
        return this._countries.getLoadError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadShippingCountriesError() {
        return this._shippingCountries.getLoadError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadPaymentMethodsError() {
        return this._paymentMethods.getLoadError();
    }

    /**
     * @param {string} methodId
     * @return {?ErrorResponse}
     */
    getLoadPaymentMethodError(methodId) {
        return this._paymentMethods.getLoadMethodError(methodId);
    }

    /**
     * @return {?ErrorResponse}
     */
    getSignInError() {
        return this._customer.getSignInError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getSignOutError() {
        return this._customer.getSignOutError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadShippingOptionsError() {
        return this._shippingOptions.getLoadError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getSelectShippingOptionError() {
        return this._shippingOptions.getSelectError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getUpdateBillingAddressError() {
        return this._billingAddress.getUpdateError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getUpdateShippingAddressError() {
        return this._shippingAddress.getUpdateError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getApplyCouponError() {
        return this._coupon.getApplyError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getRemoveCouponError() {
        return this._coupon.getRemoveError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getApplyGiftCertificateError() {
        return this._giftCertificate.getApplyError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getRemoveGiftCertificateError() {
        return this._giftCertificate.getRemoveError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadInstrumentsError() {
        return this._instrument.getLoadError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getVaultInstrumentError() {
        return this._instrument.getVaultError();
    }

    /**
     * @param {string} [instrumentId]
     * @return {?ErrorResponse}
     */
    getDeleteInstrumentError(instrumentId) {
        return this._instrument.getDeleteError(instrumentId);
    }
}
