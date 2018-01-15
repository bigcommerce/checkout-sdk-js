import { MissingDataError } from '../common/error/errors';
import { OrderFinalizationNotRequiredError } from '../order/errors';

export default class CheckoutService {
    /**
     * @constructor
     * @param {DataStore} store
     * @param {PaymentStrategyRegistry} paymentStrategyRegistry
     * @param {BillingAddressActionCreator} billingAddressActionCreator
     * @param {CartActionCreator} cartActionCreator
     * @param {CountryActionCreator} countryActionCreator
     * @param {CouponActionCreator} couponActionCreator
     * @param {CustomerActionCreator} customerActionCreator
     * @param {GiftCertificateActionCreator} giftCertificateActionCreator
     * @param {InstrumentActionCreator} instrumentActionCreator
     * @param {OrderActionCreator} orderActionCreator
     * @param {PaymentMethodActionCreator} paymentMethodActionCreator
     * @param {QuoteActionCreator} quoteActionCreator
     * @param {ShippingAddressActionCreator} shippingAddressActionCreator
     * @param {ShippingCountryActionCreator} shippingCountryActionCreator
     * @param {ShippingOptionActionCreator} shippingOptionActionCreator
     */
    constructor(
        store,
        paymentStrategyRegistry,
        billingAddressActionCreator,
        cartActionCreator,
        countryActionCreator,
        couponActionCreator,
        customerActionCreator,
        giftCertificateActionCreator,
        instrumentActionCreator,
        orderActionCreator,
        paymentMethodActionCreator,
        quoteActionCreator,
        shippingAddressActionCreator,
        shippingCountryActionCreator,
        shippingOptionActionCreator
    ) {
        this._store = store;
        this._paymentStrategyRegistry = paymentStrategyRegistry;
        this._billingAddressActionCreator = billingAddressActionCreator;
        this._cartActionCreator = cartActionCreator;
        this._countryActionCreator = countryActionCreator;
        this._couponActionCreator = couponActionCreator;
        this._customerActionCreator = customerActionCreator;
        this._giftCertificateActionCreator = giftCertificateActionCreator;
        this._instrumentActionCreator = instrumentActionCreator;
        this._orderActionCreator = orderActionCreator;
        this._paymentMethodActionCreator = paymentMethodActionCreator;
        this._quoteActionCreator = quoteActionCreator;
        this._shippingAddressActionCreator = shippingAddressActionCreator;
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
        const action = this._quoteActionCreator.loadQuote(options);

        return this._store.dispatch(action);
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
     * @param {Cart} cart
     * @return {Promise<CheckoutSelectors>}
     */
    updateCart(cart) {
        const action = this._cartActionCreator.updateCart(cart);

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
        const action = this._orderActionCreator.loadOrder(orderId, options);

        return this._store.dispatch(action);
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

        return this._paymentStrategyRegistry.getStrategyByMethod(method).execute(payload, options);
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

        return this._paymentStrategyRegistry.getStrategyByMethod(method).finalize(options);
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
        const method = checkout.getPaymentMethod(methodId, gatewayId);

        if (!method) {
            throw new MissingDataError();
        }

        return this._paymentStrategyRegistry.getStrategyByMethod(method).initialize(options);
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

        return this._paymentStrategyRegistry.getStrategyByMethod(method).deinitialize();
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
     * @param {CustomerCredentials} credentials
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    signInCustomer(credentials, options) {
        const action = this._customerActionCreator.signInCustomer(credentials, options);

        return this._store.dispatch(action);
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    signOutCustomer(options) {
        const action = this._customerActionCreator.signOutCustomer(options);

        return this._store.dispatch(action);
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
     * @param {string} addressId
     * @param {string} shippingOptionId
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    selectShippingOption(addressId, shippingOptionId, options) {
        const action = this._shippingOptionActionCreator.selectShippingOption(addressId, shippingOptionId, options);

        return this._store.dispatch(action);
    }

    /**
     * @param {Address} address
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    updateShippingAddress(address, options) {
        const action = this._shippingAddressActionCreator.updateAddress(address, options);

        return this._store.dispatch(action);
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
        const { checkout } = this._store.getState();

        if (!checkout.getConfig() || !checkout.getCustomer()) {
            throw new MissingDataError();
        }

        const { storeId } = checkout.getConfig();
        const { customerId } = checkout.getCustomer();

        const action = this._instrumentActionCreator.loadInstruments(storeId, customerId);

        return this._store.dispatch(action);
    }

    /**
     * @param {InstrumentRequestBody} instrument
     * @return {Promise<CheckoutSelectors>}
     */
    vaultInstrument(instrument) {
        const { checkout } = this._store.getState();

        if (!checkout.getConfig() || !checkout.getCustomer()) {
            throw new MissingDataError();
        }

        const { storeId } = checkout.getConfig();
        const { customerId } = checkout.getCustomer();

        const action = this._instrumentActionCreator.vaultInstrument(storeId, customerId, instrument);

        return this._store.dispatch(action);
    }

    /**
     * @param {string} instrumentId
     * @return {Promise<CheckoutSelectors>}
     */
    deleteInstrument(instrumentId) {
        const { checkout } = this._store.getState();

        if (!checkout.getConfig() || !checkout.getCustomer()) {
            throw new MissingDataError();
        }

        const { storeId } = checkout.getConfig();
        const { customerId } = checkout.getCustomer();

        const action = this._instrumentActionCreator.deleteInstrument(storeId, customerId, instrumentId);

        return this._store.dispatch(action);
    }
}
