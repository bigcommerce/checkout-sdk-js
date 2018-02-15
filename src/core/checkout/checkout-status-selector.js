export default class CheckoutStatusSelector {
    /**
     * @constructor
     * @param {BillingAddressSelector} billingAddress
     * @param {CartSelector} cart
     * @param {ConfigSelector} config
     * @param {CountrySelector} countries
     * @param {CouponSelector} coupon
     * @param {CustomerSelector} customer
     * @param {GiftCertificateSelector} giftCertificate
     * @param {InstrumentSelector} instruments
     * @param {OrderSelector} order
     * @param {PaymentMethodSelector} paymentMethods
     * @param {QuoteSelector} quote
     * @param {RemoteCheckoutSelector} remoteCheckout
     * @param {ShippingSelector} shipping
     * @param {ShippingAddressSelector} shippingAddress
     * @param {ShippingCountrySelector} shippingCountries
     * @param {ShippingOptionSelector} shippingOptions
     */
    constructor(
        billingAddress,
        cart,
        config,
        countries,
        coupon,
        customer,
        giftCertificate,
        instruments,
        order,
        paymentMethods,
        quote,
        remoteCheckout,
        shipping,
        shippingAddress,
        shippingCountries,
        shippingOptions
    ) {
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

    /**
     * @return {boolean}
     */
    isPending() {
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
    }

    /**
     * @return {boolean}
     */
    isLoadingCheckout() {
        return this._quote.isLoading();
    }

    /**
     * @return {boolean}
     */
    isSubmittingOrder() {
        return this._order.isSubmitting();
    }

    /**
     * @return {boolean}
     */
    isFinalizingOrder() {
        return this._order.isFinalizing();
    }

    /**
     * @return {boolean}
     */
    isLoadingOrder() {
        return this._order.isLoading();
    }

    /**
     * @return {boolean}
     */
    isLoadingCart() {
        return this._cart.isLoading();
    }

    /**
     * @return {boolean}
     */
    isVerifyingCart() {
        return this._cart.isVerifying();
    }

    /**
     * @return {boolean}
     */
    isLoadingBillingCountries() {
        return this._countries.isLoading();
    }

    /**
     * @return {boolean}
     */
    isLoadingShippingCountries() {
        return this._shippingCountries.isLoading();
    }

    /**
     * @return {boolean}
     */
    isLoadingPaymentMethods() {
        return this._paymentMethods.isLoading();
    }

    /**
     * @param {string} methodId
     * @return {boolean}
     */
    isLoadingPaymentMethod(methodId) {
        return this._paymentMethods.isLoadingMethod(methodId);
    }

    /**
     * @param {?string} methodId
     * @return {boolean}
     */
    isInitializingPaymentMethod(methodId) {
        return this._paymentMethods.isInitializingMethod(methodId) || this._remoteCheckout.isInitializingPayment(methodId);
    }

    /**
     * @return {boolean}
     */
    isSigningIn() {
        return this._customer.isSigningIn();
    }

    /**
     * @return {boolean}
     */
    isSigningOut() {
        return this._customer.isSigningOut();
    }

    /**
     * @param {?string} methodId
     * @return {boolean}
     */
    isInitializingCustomer(methodId) {
        return this._customer.isInitializing(methodId);
    }

    /**
     * @return {boolean}
     */
    isLoadingShippingOptions() {
        return this._shippingOptions.isLoading();
    }

    /**
     * @return {boolean}
     */
    isSelectingShippingOption() {
        return this._shippingOptions.isSelecting();
    }

    /**
     * @return {boolean}
     */
    isUpdatingBillingAddress() {
        return this._billingAddress.isUpdating();
    }

    /**
     * @return {boolean}
     */
    isUpdatingShippingAddress() {
        return this._shippingAddress.isUpdating();
    }

    /**
     * @param {?string} methodId
     * @return {boolean}
     */
    isInitializingShipping(methodId) {
        return this._shipping.isInitializing(methodId) || this._remoteCheckout.isInitializingShipping(methodId);
    }

    /**
     * @return {boolean}
     */
    isApplyingCoupon() {
        return this._coupon.isApplying();
    }

    /**
     * @return {boolean}
     */
    isRemovingCoupon() {
        return this._coupon.isRemoving();
    }

    /**
     * @return {boolean}
     */
    isApplyingGiftCertificate() {
        return this._giftCertificate.isApplying();
    }

    /**
     * @return {boolean}
     */
    isRemovingGiftCertificate() {
        return this._giftCertificate.isRemoving();
    }

    /**
     * @return {boolean}
     */
    isLoadingInstruments() {
        return this._instruments.isLoading();
    }

    /**
    * @return {boolean}
    */
    isVaultingInstrument() {
        return this._instruments.isVaulting();
    }

    /**
     * @param {string} [instrumentId]
     * @return {boolean}
     */
    isDeletingInstrument(instrumentId) {
        return this._instruments.isDeleting(instrumentId);
    }

    /**
     * @return {boolean}
     */
    isLoadingConfig() {
        return this._config.isLoading();
    }
}
