import { MissingDataError } from '../common/error/errors';
import { OrderFinalizationNotRequiredError } from '../order/errors';

export default class CheckoutService {
    /**
     * @constructor
     * @param {DataStore} store
     * @param {Registry<CustomerStrategy>} customerStrategyRegistry
     * @param {PaymentStrategyRegistry} paymentStrategyRegistry
     * @param {Registry<ShippingStrategy>} shippingStrategyRegistry
     * @param {BillingAddressActionCreator} billingAddressActionCreator
     * @param {CartActionCreator} cartActionCreator
     * @param {CheckoutActionCreator} checkoutActionCreator
     * @param {ConfigActionCreator} configActionCreator
     * @param {CountryActionCreator} countryActionCreator
     * @param {CouponActionCreator} couponActionCreator
     * @param {CustomerActionCreator} customerActionCreator
     * @param {GiftCertificateActionCreator} giftCertificateActionCreator
     * @param {InstrumentActionCreator} instrumentActionCreator
     * @param {OrderActionCreator} orderActionCreator
     * @param {PaymentMethodActionCreator} paymentMethodActionCreator
     * @param {QuoteActionCreator} quoteActionCreator
     * @param {ShippingCountryActionCreator} shippingCountryActionCreator
     * @param {ShippingOptionActionCreator} shippingOptionActionCreator
     */
    constructor(
        store,
        customerStrategyRegistry,
        paymentStrategyRegistry,
        shippingStrategyRegistry,
        billingAddressActionCreator,
        cartActionCreator,
        checkoutActionCreator,
        configActionCreator,
        countryActionCreator,
        couponActionCreator,
        customerActionCreator,
        giftCertificateActionCreator,
        instrumentActionCreator,
        orderActionCreator,
        paymentMethodActionCreator,
        quoteActionCreator,
        shippingCountryActionCreator,
        shippingOptionActionCreator
    ) {
        this._store = store;
        this._customerStrategyRegistry = customerStrategyRegistry;
        this._paymentStrategyRegistry = paymentStrategyRegistry;
        this._shippingStrategyRegistry = shippingStrategyRegistry;
        this._billingAddressActionCreator = billingAddressActionCreator;
        this._cartActionCreator = cartActionCreator;
        this._checkoutActionCreator = checkoutActionCreator;
        this._configActionCreator = configActionCreator;
        this._countryActionCreator = countryActionCreator;
        this._couponActionCreator = couponActionCreator;
        this._customerActionCreator = customerActionCreator;
        this._giftCertificateActionCreator = giftCertificateActionCreator;
        this._instrumentActionCreator = instrumentActionCreator;
        this._orderActionCreator = orderActionCreator;
        this._paymentMethodActionCreator = paymentMethodActionCreator;
        this._quoteActionCreator = quoteActionCreator;
        this._shippingCountryActionCreator = shippingCountryActionCreator;
        this._shippingOptionActionCreator = shippingOptionActionCreator;
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
        const { checkout } = this._store.getState();
        const { payment = {} } = payload;
        const method = checkout.getPaymentMethod(payment.name, payment.gateway);

        if (!method) {
            throw new MissingDataError();
        }

        return this._paymentStrategyRegistry.getByMethod(method).execute(payload, options);
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
        const { checkout } = this._store.getState();
        const order = checkout.getOrder();

        if (!order) {
            throw new MissingDataError();
        }

        if (!order.payment || !order.payment.id) {
            return Promise.reject(new OrderFinalizationNotRequiredError());
        }

        const method = checkout.getPaymentMethod(order.payment.id, order.payment.gateway);

        if (!method) {
            throw new MissingDataError();
        }

        return this._paymentStrategyRegistry.getByMethod(method).finalize(options);
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
        const { checkout } = this._store.getState();
        const paymentMethod = checkout.getPaymentMethod(methodId, gatewayId);

        if (!paymentMethod) {
            throw new MissingDataError();
        }

        return this._paymentStrategyRegistry.getByMethod(paymentMethod)
            .initialize({
                ...options,
                paymentMethod,
            });
    }

    /**
     * @param {string} methodId
     * @param {string} [gatewayId]
     * @return {Promise<CheckoutSelectors>}
     */
    deinitializePaymentMethod(methodId, gatewayId) {
        const { checkout } = this._store.getState();
        const method = checkout.getPaymentMethod(methodId, gatewayId);

        if (!method) {
            throw new MissingDataError();
        }

        return this._paymentStrategyRegistry.getByMethod(method).deinitialize();
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
     * @param {CustomerCredentials} credentials
     * @param {RequestOptions} [options]
     * @param {any} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    initializeCustomer(options = {}) {
        const { methodId } = options;
        const strategy = this._customerStrategyRegistry.get(methodId);

        if (methodId) {
            return this.loadPaymentMethod(methodId)
                .then(({ checkout }) => strategy.initialize({
                    ...options,
                    paymentMethod: checkout.getPaymentMethod(methodId),
                }));
        }

        return strategy.initialize(options);
    }

    /**
     * @param {any} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    deinitializeCustomer(options = {}) {
        return this._customerStrategyRegistry.get(options.methodId)
            .deinitialize(options);
    }

    /**
     * @param {CustomerCredentials} credentials
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    signInCustomer(credentials, options = {}) {
        return this._customerStrategyRegistry.get(options.methodId)
            .signIn(credentials, options);
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    signOutCustomer(options = {}) {
        return this._customerStrategyRegistry.get(options.methodId)
            .signOut(options);
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
        const { remote = {} } = this._store.getState().checkout.getCustomer() || {};

        if (remote.provider) {
            return this.loadPaymentMethod(remote.provider)
                .then(() => {
                    const paymentMethod = this._store.getState().checkout.getPaymentMethod(remote.provider);

                    return this._shippingStrategyRegistry.get(remote.provider)
                        .initialize({ ...options, paymentMethod });
                });
        }

        return this._shippingStrategyRegistry.get().initialize(options);
    }

    /**
     * @param {Object} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    deinitializeShipping(options) {
        const { remote = {} } = this._store.getState().checkout.getCustomer() || {};

        return this._shippingStrategyRegistry.get(remote.provider).deinitialize(options);
    }

    /**
     * @param {string} addressId
     * @param {string} shippingOptionId
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    selectShippingOption(addressId, shippingOptionId, options) {
        const { checkout } = this._store.getState();
        const { remote = {} } = checkout.getCustomer() || {};

        return this._shippingStrategyRegistry.get(remote.provider)
            .selectOption(addressId, shippingOptionId, options);
    }

    /**
     * @param {Address} address
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    updateShippingAddress(address, options) {
        const { checkout } = this._store.getState();
        const { remote = {} } = checkout.getCustomer() || {};

        return this._shippingStrategyRegistry.get(remote.provider)
            .updateAddress(address, options);
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
        const action = this._couponActionCreator.applyCoupon(code, options);

        return this._store.dispatch(action);
    }

    /**
     * @param {string} code
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    removeCoupon(code, options = {}) {
        const action = this._couponActionCreator.removeCoupon(code, options);

        return this._store.dispatch(action);
    }

    /**
     * @param {string} code
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    applyGiftCertificate(code, options = {}) {
        const action = this._giftCertificateActionCreator.applyGiftCertificate(code, options);

        return this._store.dispatch(action);
    }

    /**
     * @param {string} code
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    removeGiftCertificate(code, options = {}) {
        const action = this._giftCertificateActionCreator.removeGiftCertificate(code, options);

        return this._store.dispatch(action);
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
