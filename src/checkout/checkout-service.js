import { MissingDataError } from '../common/error/errors';

export default class CheckoutService {
    /**
     * @constructor
     * @param {DataStore} store
     * @param {BillingAddressActionCreator} billingAddressActionCreator
     * @param {CartActionCreator} cartActionCreator
     * @param {CheckoutActionCreator} checkoutActionCreator
     * @param {ConfigActionCreator} configActionCreator
     * @param {CountryActionCreator} countryActionCreator
     * @param {CouponActionCreator} couponActionCreator
     * @param {CustomerStrategyActionCreator} customerStrategyActionCreator
     * @param {GiftCertificateActionCreator} giftCertificateActionCreator
     * @param {InstrumentActionCreator} instrumentActionCreator
     * @param {OrderActionCreator} orderActionCreator
     * @param {PaymentMethodActionCreator} paymentMethodActionCreator
     * @param {PaymentStrategyActionCreator} paymentStrategyActionCreator
     * @param {QuoteActionCreator} quoteActionCreator
     * @param {ShippingCountryActionCreator} shippingCountryActionCreator
     * @param {ShippingOptionActionCreator} shippingOptionActionCreator
     * @param {ShippingStrategyActionCreator} shippingStrategyActionCreator
     */
    constructor(
        store,
        billingAddressActionCreator,
        cartActionCreator,
        checkoutActionCreator,
        configActionCreator,
        countryActionCreator,
        couponActionCreator,
        customerStrategyActionCreator,
        giftCertificateActionCreator,
        instrumentActionCreator,
        orderActionCreator,
        paymentMethodActionCreator,
        paymentStrategyActionCreator,
        quoteActionCreator,
        shippingCountryActionCreator,
        shippingOptionActionCreator,
        shippingStrategyActionCreator
    ) {
        this._store = store;
        this._billingAddressActionCreator = billingAddressActionCreator;
        this._cartActionCreator = cartActionCreator;
        this._checkoutActionCreator = checkoutActionCreator;
        this._configActionCreator = configActionCreator;
        this._countryActionCreator = countryActionCreator;
        this._couponActionCreator = couponActionCreator;
        this._customerStrategyActionCreator = customerStrategyActionCreator;
        this._giftCertificateActionCreator = giftCertificateActionCreator;
        this._instrumentActionCreator = instrumentActionCreator;
        this._orderActionCreator = orderActionCreator;
        this._paymentMethodActionCreator = paymentMethodActionCreator;
        this._paymentStrategyActionCreator = paymentStrategyActionCreator;
        this._quoteActionCreator = quoteActionCreator;
        this._shippingCountryActionCreator = shippingCountryActionCreator;
        this._shippingOptionActionCreator = shippingOptionActionCreator;
        this._shippingStrategyActionCreator = shippingStrategyActionCreator;
    }

    /**
     * @return {CheckoutSelectors}
     */
    getState() {
        return this._store.getState();
    }

    /**
     * @return {void}
     */
    notifyState() {
        this._store.notifyState();
    }

    /**
     * @param {function(state: CheckoutSelectors): void} subscriber
     * @param {...function(state: Object): any} [filters]
     * @return {function(): void}
     */
    subscribe(subscriber, ...filters) {
        return this._store.subscribe(
            () => subscriber(this.getState()),
            ...filters
        );
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    loadCheckout(options) {
        return Promise.all([
            this._store.dispatch(this._quoteActionCreator.loadQuote(options)),
            this._store.dispatch(this._checkoutActionCreator.loadCheckout(options)),
            this._store.dispatch(this._configActionCreator.loadConfig(options), { queueId: 'config' }),
        ]).then(() => this._store.getState());
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    loadCart(options) {
        const action = this._cartActionCreator.loadCart(options);

        return this._store.dispatch(action);
    }

    /**
     * @deprecated
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    verifyCart(options) {
        const { checkout } = this._store.getState();
        const action = this._cartActionCreator.verifyCart(checkout.getCart(), options);

        return this._store.dispatch(action);
    }

    /**
     * @param {number} orderId
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    loadOrder(orderId, options) {
        return Promise.all([
            this._store.dispatch(this._orderActionCreator.loadInternalOrder(orderId, options)),
            this._store.dispatch(this._orderActionCreator.loadOrder(orderId, options)),
        ]).then(() => this._store.getState());
    }

    /**
     * @param {OrderRequestBody} payload
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    submitOrder(payload, options) {
        const action = this._paymentStrategyActionCreator.execute(payload, options);

        return this._store.dispatch(action, { queueId: 'paymentStrategy' });
    }

    /**
     * @deprecated
     * @param {number} orderId
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    finalizeOrder(orderId, options) {
        const action = this._orderActionCreator.finalizeOrder(orderId, options);

        return this._store.dispatch(action);
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    finalizeOrderIfNeeded(options) {
        const action = this._paymentStrategyActionCreator.finalize(options);

        return this._store.dispatch(action, { queueId: 'paymentStrategy' });
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    loadPaymentMethods(options) {
        const action = this._paymentMethodActionCreator.loadPaymentMethods(options);

        return this._store.dispatch(action, { queueId: 'paymentMethods' });
    }

    /**
     * @param {string} methodId
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    loadPaymentMethod(methodId, options) {
        const action = this._paymentMethodActionCreator.loadPaymentMethod(methodId, options);

        return this._store.dispatch(action, { queueId: 'paymentMethods' });
    }

    /**
     * @param {string} methodId
     * @param {string} [gatewayId]
     * @param {Object} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    initializePaymentMethod(methodId, gatewayId, options) {
        const action = this._paymentStrategyActionCreator.initialize(methodId, gatewayId, options);

        return this._store.dispatch(action, { queueId: 'paymentStrategy' });
    }

    /**
     * @param {string} methodId
     * @param {string} [gatewayId]
     * @param {Object} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    deinitializePaymentMethod(methodId, gatewayId, options) {
        const action = this._paymentStrategyActionCreator.deinitialize(methodId, gatewayId, options);

        return this._store.dispatch(action, { queueId: 'paymentStrategy' });
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    loadBillingCountries(options) {
        const action = this._countryActionCreator.loadCountries(options);

        return this._store.dispatch(action, { queueId: 'billingCountries' });
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    loadShippingCountries(options) {
        const action = this._shippingCountryActionCreator.loadCountries(options);

        return this._store.dispatch(action, { queueId: 'shippingCountries' });
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    loadBillingAddressFields(options) {
        return this.loadBillingCountries(options);
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    loadShippingAddressFields(options) {
        return this.loadShippingCountries(options);
    }

    /**
     * @param {RequestOptions} [options]
     * @param {any} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    initializeCustomer(options = {}) {
        return this._store.dispatch(
            this._customerStrategyActionCreator.initialize(options),
            { queueId: 'customerStrategy' }
        );
    }

    /**
     * @param {any} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    deinitializeCustomer(options = {}) {
        return this._store.dispatch(
            this._customerStrategyActionCreator.deinitialize(options),
            { queueId: 'customerStrategy' }
        );
    }

    /**
     * @param {CustomerCredentials} credentials
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    signInCustomer(credentials, options = {}) {
        return this._store.dispatch(
            this._customerStrategyActionCreator.signIn(credentials, options),
            { queueId: 'customerStrategy' }
        );
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    signOutCustomer(options = {}) {
        return this._store.dispatch(
            this._customerStrategyActionCreator.signOut(options),
            { queueId: 'customerStrategy' }
        );
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    loadShippingOptions(options) {
        const action = this._shippingOptionActionCreator.loadShippingOptions(options);

        return this._store.dispatch(action);
    }

    /**
     * @param {Object} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    initializeShipping(options) {
        const action = this._shippingStrategyActionCreator.initialize(options);

        return this._store.dispatch(action, { queueId: 'shippingStrategy' });
    }

    /**
     * @param {Object} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    deinitializeShipping(options) {
        const action = this._shippingStrategyActionCreator.deinitialize(options);

        return this._store.dispatch(action, { queueId: 'shippingStrategy' });
    }

    /**
     * @param {string} addressId
     * @param {string} shippingOptionId
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    selectShippingOption(addressId, shippingOptionId, options) {
        const action = this._shippingStrategyActionCreator.selectOption(addressId, shippingOptionId, options);

        return this._store.dispatch(action, { queueId: 'shippingStrategy' });
    }

    /**
     * @param {Address} address
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    updateShippingAddress(address, options) {
        const action = this._shippingStrategyActionCreator.updateAddress(address, options);

        return this._store.dispatch(action, { queueId: 'shippingStrategy' });
    }

    /**
     * @param {Address} address
     * @param {Object} options
     * @param {Promise<void>} options.timeout
     * @return {Promise<CheckoutSelectors>}
     */
    updateBillingAddress(address, options = {}) {
        const action = this._billingAddressActionCreator.updateAddress(address, options);

        return this._store.dispatch(action);
    }

    /**
     * @param {string} code
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    applyCoupon(code, options = {}) {
        const { checkout } = this._store.getState();
        const checkoutId = checkout.getCheckout().id;

        return Promise.all([
            this._store.dispatch(this._quoteActionCreator.loadQuote(options)),
            this._store.dispatch(this._couponActionCreator.applyCoupon(checkoutId, code, options)),
        ]).then(() => this._store.getState());
    }

    /**
     * @param {string} code
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    removeCoupon(code, options = {}) {
        const { checkout } = this._store.getState();
        const checkoutId = checkout.getCheckout().id;

        return Promise.all([
            this._store.dispatch(this._quoteActionCreator.loadQuote(options)),
            this._store.dispatch(this._couponActionCreator.removeCoupon(checkoutId, code, options)),
        ]).then(() => this._store.getState());
    }

    /**
     * @param {string} code
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    applyGiftCertificate(code, options = {}) {
        const { checkout } = this._store.getState();
        const checkoutId = checkout.getCheckout().id;

        return Promise.all([
            this._store.dispatch(this._quoteActionCreator.loadQuote(options)),
            this._store.dispatch(this._giftCertificateActionCreator.applyGiftCertificate(checkoutId, code, options)),
        ]).then(() => this._store.getState());
    }

    /**
     * @param {string} code
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    removeGiftCertificate(code, options = {}) {
        const { checkout } = this._store.getState();
        const checkoutId = checkout.getCheckout().id;

        return Promise.all([
            this._store.dispatch(this._quoteActionCreator.loadQuote(options)),
            this._store.dispatch(this._giftCertificateActionCreator.removeGiftCertificate(checkoutId, code, options)),
        ]).then(() => this._store.getState());
    }

    /**
     * @return {Promise<CheckoutSelectors>}
     */
    loadInstruments() {
        const { storeId, customerId, token } = this._getInstrumentState();

        const action = this._instrumentActionCreator.loadInstruments(
            storeId,
            customerId,
            token
        );

        return this._store.dispatch(action);
    }

    /**
     * @param {InstrumentRequestBody} instrument
     * @return {Promise<CheckoutSelectors>}
     */
    vaultInstrument(instrument) {
        const { storeId, customerId, token } = this._getInstrumentState();

        const action = this._instrumentActionCreator.vaultInstrument(
            storeId,
            customerId,
            token,
            instrument
        );

        return this._store.dispatch(action);
    }

    /**
     * @param {string} instrumentId
     * @return {Promise<CheckoutSelectors>}
     */
    deleteInstrument(instrumentId) {
        const { storeId, customerId, token } = this._getInstrumentState();

        const action = this._instrumentActionCreator.deleteInstrument(
            storeId,
            customerId,
            token,
            instrumentId
        );

        return this._store.dispatch(action);
    }

    /**
     * @private
     * @return {Object}
     */
    _getInstrumentState() {
        const { checkout } = this._store.getState();

        if (!checkout.getConfig() || !checkout.getCustomer() || !checkout.getCheckoutMeta()) {
            throw new MissingDataError();
        }

        const { customerId } = checkout.getCustomer();
        const { storeId } = checkout.getConfig();
        const { vaultAccessToken, vaultAccessExpiry } = checkout.getCheckoutMeta();

        return {
            customerId,
            storeId,
            token: {
                vaultAccessToken,
                vaultAccessExpiry,
            },
        };
    }
}
