"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CheckoutService = /** @class */ (function () {
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
    function CheckoutService(store, paymentStrategyRegistry, billingAddressActionCreator, cartActionCreator, countryActionCreator, couponActionCreator, customerActionCreator, giftCertificateActionCreator, instrumentActionCreator, orderActionCreator, paymentMethodActionCreator, quoteActionCreator, shippingAddressActionCreator, shippingCountryActionCreator, shippingOptionActionCreator) {
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
    CheckoutService.prototype.getState = function () {
        return this._store.getState();
    };
    /**
     * @return {void}
     */
    CheckoutService.prototype.notifyState = function () {
        this._store.notifyState();
    };
    /**
     * @param {function(state: CheckoutSelectors): void} subscriber
     * @param {...function(state: Object): any} [filters]
     * @return {function(): void}
     */
    CheckoutService.prototype.subscribe = function (subscriber) {
        var _this = this;
        var filters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            filters[_i - 1] = arguments[_i];
        }
        return (_a = this._store).subscribe.apply(_a, [function () { return subscriber(_this.getState()); }].concat(filters));
        var _a;
    };
    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.loadCheckout = function (options) {
        var action = this._quoteActionCreator.loadQuote(options);
        return this._store.dispatch(action);
    };
    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.loadCart = function (options) {
        var action = this._cartActionCreator.loadCart(options);
        return this._store.dispatch(action);
    };
    /**
     * @deprecated
     * @param {Cart} cart
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.updateCart = function (cart) {
        var action = this._cartActionCreator.updateCart(cart);
        return this._store.dispatch(action);
    };
    /**
     * @deprecated
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.verifyCart = function (options) {
        var checkout = this._store.getState().checkout;
        var action = this._cartActionCreator.verifyCart(checkout.getCart(), options);
        return this._store.dispatch(action);
    };
    /**
     * @param {number} orderId
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.loadOrder = function (orderId, options) {
        var action = this._orderActionCreator.loadOrder(orderId, options);
        return this._store.dispatch(action);
    };
    /**
     * @param {OrderRequestBody} payload
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.submitOrder = function (payload, options) {
        var checkout = this._store.getState().checkout;
        var _a = payload.payment, payment = _a === void 0 ? {} : _a;
        var method = checkout.getPaymentMethod(payment.name, payment.gateway);
        if (!method) {
            throw new Error("Unable to submit order because payment method " + payment.name + " is either not available or not loaded");
        }
        return this._paymentStrategyRegistry.getStrategyByMethod(method).execute(payload, options);
    };
    /**
     * @deprecated
     * @param {number} orderId
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.finalizeOrder = function (orderId, options) {
        var action = this._orderActionCreator.finalizeOrder(orderId, options);
        return this._store.dispatch(action);
    };
    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.finalizeOrderIfNeeded = function (options) {
        var checkout = this._store.getState().checkout;
        var _a = checkout.getOrder().payment, payment = _a === void 0 ? {} : _a;
        var method = checkout.getPaymentMethod(payment.id, payment.gateway, options);
        if (!method) {
            return Promise.reject(this._store.getState());
        }
        return this._paymentStrategyRegistry.getStrategyByMethod(method).finalize(options);
    };
    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.loadPaymentMethods = function (options) {
        var action = this._paymentMethodActionCreator.loadPaymentMethods(options);
        return this._store.dispatch(action, { queueId: 'paymentMethods' });
    };
    /**
     * @param {string} methodId
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.loadPaymentMethod = function (methodId, options) {
        var action = this._paymentMethodActionCreator.loadPaymentMethod(methodId, options);
        return this._store.dispatch(action, { queueId: 'paymentMethods' });
    };
    /**
     * @param {string} methodId
     * @param {string} [gatewayId]
     * @param {Object} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.initializePaymentMethod = function (methodId, gatewayId, options) {
        var checkout = this._store.getState().checkout;
        var method = checkout.getPaymentMethod(methodId, gatewayId);
        if (!method) {
            throw new Error("Unable to initialize method because " + methodId + " is either not available or not loaded");
        }
        return this._paymentStrategyRegistry.getStrategyByMethod(method).initialize(options);
    };
    /**
     * @param {string} methodId
     * @param {string} [gatewayId]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.deinitializePaymentMethod = function (methodId, gatewayId) {
        var checkout = this._store.getState().checkout;
        var method = checkout.getPaymentMethod(methodId, gatewayId);
        if (!method) {
            throw new Error("Unable to deinitialize method because " + methodId + " is either not available or not loaded");
        }
        return this._paymentStrategyRegistry.getStrategyByMethod(method).deinitialize();
    };
    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.loadBillingCountries = function (options) {
        var action = this._countryActionCreator.loadCountries(options);
        return this._store.dispatch(action, { queueId: 'billingCountries' });
    };
    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.loadShippingCountries = function (options) {
        var action = this._shippingCountryActionCreator.loadCountries(options);
        return this._store.dispatch(action, { queueId: 'shippingCountries' });
    };
    /**
     * @param {CustomerCredentials} credentials
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.signInCustomer = function (credentials, options) {
        var action = this._customerActionCreator.signInCustomer(credentials, options);
        return this._store.dispatch(action);
    };
    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.signOutCustomer = function (options) {
        var action = this._customerActionCreator.signOutCustomer(options);
        return this._store.dispatch(action);
    };
    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.loadShippingOptions = function (options) {
        var action = this._shippingOptionActionCreator.loadShippingOptions(options);
        return this._store.dispatch(action);
    };
    /**
     * @param {string} addressId
     * @param {string} shippingOptionId
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.selectShippingOption = function (addressId, shippingOptionId, options) {
        var action = this._shippingOptionActionCreator.selectShippingOption(addressId, shippingOptionId, options);
        return this._store.dispatch(action);
    };
    /**
     * @param {Address} address
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.updateShippingAddress = function (address, options) {
        var action = this._shippingAddressActionCreator.updateAddress(address, options);
        return this._store.dispatch(action);
    };
    /**
     * @param {Address} address
     * @param {Object} options
     * @param {Promise<void>} options.timeout
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.updateBillingAddress = function (address, options) {
        if (options === void 0) { options = {}; }
        var action = this._billingAddressActionCreator.updateAddress(address, options);
        return this._store.dispatch(action);
    };
    /**
     * @param {string} code
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.applyCoupon = function (code, options) {
        if (options === void 0) { options = {}; }
        var action = this._couponActionCreator.applyCoupon(code, options);
        return this._store.dispatch(action);
    };
    /**
     * @param {string} code
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.removeCoupon = function (code, options) {
        if (options === void 0) { options = {}; }
        var action = this._couponActionCreator.removeCoupon(code, options);
        return this._store.dispatch(action);
    };
    /**
     * @param {string} code
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.applyGiftCertificate = function (code, options) {
        if (options === void 0) { options = {}; }
        var action = this._giftCertificateActionCreator.applyGiftCertificate(code, options);
        return this._store.dispatch(action);
    };
    /**
     * @param {string} code
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.removeGiftCertificate = function (code, options) {
        if (options === void 0) { options = {}; }
        var action = this._giftCertificateActionCreator.removeGiftCertificate(code, options);
        return this._store.dispatch(action);
    };
    /**
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.loadInstruments = function () {
        var checkout = this._store.getState().checkout;
        var storeId = checkout.getConfig().storeId;
        var customerId = checkout.getCustomer().customerId;
        var action = this._instrumentActionCreator.loadInstruments(storeId, customerId);
        return this._store.dispatch(action);
    };
    /**
     * @param {InstrumentRequestBody} instrument
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.vaultInstrument = function (instrument) {
        var checkout = this._store.getState().checkout;
        var storeId = checkout.getConfig().storeId;
        var customerId = checkout.getCustomer().customerId;
        var action = this._instrumentActionCreator.vaultInstrument(storeId, customerId, instrument);
        return this._store.dispatch(action);
    };
    /**
     * @param {string} instrumentId
     * @return {Promise<CheckoutSelectors>}
     */
    CheckoutService.prototype.deleteInstrument = function (instrumentId) {
        var checkout = this._store.getState().checkout;
        var storeId = checkout.getConfig().storeId;
        var customerId = checkout.getCustomer().customerId;
        var action = this._instrumentActionCreator.deleteInstrument(storeId, customerId, instrumentId);
        return this._store.dispatch(action);
    };
    return CheckoutService;
}());
exports.default = CheckoutService;
//# sourceMappingURL=checkout-service.js.map