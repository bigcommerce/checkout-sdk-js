export default class CheckoutErrorSelector {
    /**
     * @constructor
     * @param {BillingAddressSelector} billingAddress
     * @param {CartSelector} cart
     * @param {ConfigSelector} config
     * @param {CountrySelector} countries
     * @param {CouponSelector} coupon
     * @param {CustomerSelector} customer
     * @param {CustomerStrategySelector} customerStrategy
     * @param {GiftCertificateSelector} giftCertificate
     * @param {InstrumentSelector} instruments
     * @param {OrderSelector} order
     * @param {PaymentMethodSelector} paymentMethods
     * @param {QuoteSelector} quote
     * @param {RemoteCheckout} remoteCheckout
     * @param {ShippingAddressSelector} shippingAddress
     * @param {ShippingCountrySelector} shippingCountries
     * @param {ShippingOptionSelector} shippingOptions
     * @param {ShippingStrategySelector} shippingStrategy
     */
    constructor(
        billingAddress,
        cart,
        config,
        countries,
        coupon,
        customer,
        customerStrategy,
        giftCertificate,
        instruments,
        order,
        paymentMethods,
        quote,
        remoteCheckout,
        shippingAddress,
        shippingCountries,
        shippingOptions,
        shippingStrategy
    ) {
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
        this._quote = quote;
        this._remoteCheckout = remoteCheckout;
        this._shippingAddress = shippingAddress;
        this._shippingCountries = shippingCountries;
        this._shippingOptions = shippingOptions;
        this._shippingStrategy = shippingStrategy;
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
     * @param {string} methodId
     * @return {?ErrorResponse}
     */
    getInitializePaymentMethodError(methodId) {
        return this._paymentMethods.getInitializeError(methodId) || this._remoteCheckout.getInitializePaymentError(methodId);
    }

    /**
     * @return {?ErrorResponse}
     */
    getSignInError() {
        return this._customerStrategy.getSignInError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getSignOutError() {
        return this._customerStrategy.getSignOutError();
    }

    /**
     * @param {string} methodId
     * @return {?ErrorResponse}
     */
    getInitializeCustomerError(methodId) {
        return this._customerStrategy.getInitializeError(methodId);
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
        return this._shippingStrategy.getSelectOptionError();
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
        return this._shippingStrategy.getUpdateAddressError();
    }

    /**
     * @param {string} methodId
     * @return {?ErrorResponse}
     */
    getInitializeShippingError(methodId) {
        return this._shippingStrategy.getInitializeError(methodId);
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
        return this._instruments.getLoadError();
    }

    /**
     * @return {?ErrorResponse}
     */
    getVaultInstrumentError() {
        return this._instruments.getVaultError();
    }

    /**
     * @param {string} [instrumentId]
     * @return {?ErrorResponse}
     */
    getDeleteInstrumentError(instrumentId) {
        return this._instruments.getDeleteError(instrumentId);
    }

    /**
     * @return {?ErrorResponse}
     */
    getLoadConfigError() {
        return this._config.getLoadError();
    }
}
