export default class CheckoutStatusSelector {
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
    constructor(
        billingAddress,
        cart,
        countries,
        coupon,
        customer,
        giftCertificate,
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
    isPending() {
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
    }

    /**
     * @return {boolean}
     */
    isLoadingQuote() {
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
}
