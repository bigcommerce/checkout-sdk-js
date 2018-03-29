"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../common/error/errors");
var CheckoutService = (function () {
    function CheckoutService(store, billingAddressActionCreator, cartActionCreator, configActionCreator, countryActionCreator, couponActionCreator, customerStrategyActionCreator, giftCertificateActionCreator, instrumentActionCreator, orderActionCreator, paymentMethodActionCreator, paymentStrategyActionCreator, quoteActionCreator, shippingCountryActionCreator, shippingOptionActionCreator, shippingStrategyActionCreator) {
        this._store = store;
        this._billingAddressActionCreator = billingAddressActionCreator;
        this._cartActionCreator = cartActionCreator;
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
    CheckoutService.prototype.getState = function () {
        return this._store.getState();
    };
    CheckoutService.prototype.notifyState = function () {
        this._store.notifyState();
    };
    CheckoutService.prototype.subscribe = function (subscriber) {
        var _this = this;
        var filters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            filters[_i - 1] = arguments[_i];
        }
        return (_a = this._store).subscribe.apply(_a, [function () { return subscriber(_this.getState()); }].concat(filters));
        var _a;
    };
    CheckoutService.prototype.loadCheckout = function (options) {
        var _this = this;
        return Promise.all([
            this._store.dispatch(this._quoteActionCreator.loadQuote(options)),
            this._store.dispatch(this._configActionCreator.loadConfig(options), { queueId: 'config' }),
        ]).then(function () { return _this._store.getState(); });
    };
    CheckoutService.prototype.loadCart = function (options) {
        var action = this._cartActionCreator.loadCart(options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.verifyCart = function (options) {
        var checkout = this._store.getState().checkout;
        var action = this._cartActionCreator.verifyCart(checkout.getCart(), options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.loadOrder = function (orderId, options) {
        var action = this._orderActionCreator.loadOrder(orderId, options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.submitOrder = function (payload, options) {
        var action = this._paymentStrategyActionCreator.execute(payload, options);
        return this._store.dispatch(action, { queueId: 'paymentStrategy' });
    };
    CheckoutService.prototype.finalizeOrder = function (orderId, options) {
        var action = this._orderActionCreator.finalizeOrder(orderId, options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.finalizeOrderIfNeeded = function (options) {
        var action = this._paymentStrategyActionCreator.finalize(options);
        return this._store.dispatch(action, { queueId: 'paymentStrategy' });
    };
    CheckoutService.prototype.loadPaymentMethods = function (options) {
        var action = this._paymentMethodActionCreator.loadPaymentMethods(options);
        return this._store.dispatch(action, { queueId: 'paymentMethods' });
    };
    CheckoutService.prototype.loadPaymentMethod = function (methodId, options) {
        var action = this._paymentMethodActionCreator.loadPaymentMethod(methodId, options);
        return this._store.dispatch(action, { queueId: 'paymentMethods' });
    };
    CheckoutService.prototype.initializePaymentMethod = function (methodId, gatewayId, options) {
        var action = this._paymentStrategyActionCreator.initialize(methodId, gatewayId, options);
        return this._store.dispatch(action, { queueId: 'paymentStrategy' });
    };
    CheckoutService.prototype.deinitializePaymentMethod = function (methodId, gatewayId, options) {
        var action = this._paymentStrategyActionCreator.deinitialize(methodId, gatewayId, options);
        return this._store.dispatch(action, { queueId: 'paymentStrategy' });
    };
    CheckoutService.prototype.loadBillingCountries = function (options) {
        var action = this._countryActionCreator.loadCountries(options);
        return this._store.dispatch(action, { queueId: 'billingCountries' });
    };
    CheckoutService.prototype.loadShippingCountries = function (options) {
        var action = this._shippingCountryActionCreator.loadCountries(options);
        return this._store.dispatch(action, { queueId: 'shippingCountries' });
    };
    CheckoutService.prototype.loadBillingAddressFields = function (options) {
        return this.loadBillingCountries(options);
    };
    CheckoutService.prototype.loadShippingAddressFields = function (options) {
        return this.loadShippingCountries(options);
    };
    CheckoutService.prototype.initializeCustomer = function (options) {
        if (options === void 0) { options = {}; }
        return this._store.dispatch(this._customerStrategyActionCreator.initialize(options), { queueId: 'customerStrategy' });
    };
    CheckoutService.prototype.deinitializeCustomer = function (options) {
        if (options === void 0) { options = {}; }
        return this._store.dispatch(this._customerStrategyActionCreator.deinitialize(options), { queueId: 'customerStrategy' });
    };
    CheckoutService.prototype.signInCustomer = function (credentials, options) {
        if (options === void 0) { options = {}; }
        return this._store.dispatch(this._customerStrategyActionCreator.signIn(credentials, options), { queueId: 'customerStrategy' });
    };
    CheckoutService.prototype.signOutCustomer = function (options) {
        if (options === void 0) { options = {}; }
        return this._store.dispatch(this._customerStrategyActionCreator.signOut(options), { queueId: 'customerStrategy' });
    };
    CheckoutService.prototype.loadShippingOptions = function (options) {
        var action = this._shippingOptionActionCreator.loadShippingOptions(options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.initializeShipping = function (options) {
        var action = this._shippingStrategyActionCreator.initialize(options);
        return this._store.dispatch(action, { queueId: 'shippingStrategy' });
    };
    CheckoutService.prototype.deinitializeShipping = function (options) {
        var action = this._shippingStrategyActionCreator.deinitialize(options);
        return this._store.dispatch(action, { queueId: 'shippingStrategy' });
    };
    CheckoutService.prototype.selectShippingOption = function (addressId, shippingOptionId, options) {
        var action = this._shippingStrategyActionCreator.selectOption(addressId, shippingOptionId, options);
        return this._store.dispatch(action, { queueId: 'shippingStrategy' });
    };
    CheckoutService.prototype.updateShippingAddress = function (address, options) {
        var action = this._shippingStrategyActionCreator.updateAddress(address, options);
        return this._store.dispatch(action, { queueId: 'shippingStrategy' });
    };
    CheckoutService.prototype.updateBillingAddress = function (address, options) {
        if (options === void 0) { options = {}; }
        var action = this._billingAddressActionCreator.updateAddress(address, options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.applyCoupon = function (code, options) {
        if (options === void 0) { options = {}; }
        var action = this._couponActionCreator.applyCoupon(code, options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.removeCoupon = function (code, options) {
        if (options === void 0) { options = {}; }
        var action = this._couponActionCreator.removeCoupon(code, options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.applyGiftCertificate = function (code, options) {
        if (options === void 0) { options = {}; }
        var action = this._giftCertificateActionCreator.applyGiftCertificate(code, options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.removeGiftCertificate = function (code, options) {
        if (options === void 0) { options = {}; }
        var action = this._giftCertificateActionCreator.removeGiftCertificate(code, options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.loadInstruments = function () {
        var _a = this._getInstrumentState(), storeId = _a.storeId, customerId = _a.customerId, token = _a.token;
        var action = this._instrumentActionCreator.loadInstruments(storeId, customerId, token);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.vaultInstrument = function (instrument) {
        var _a = this._getInstrumentState(), storeId = _a.storeId, customerId = _a.customerId, token = _a.token;
        var action = this._instrumentActionCreator.vaultInstrument(storeId, customerId, token, instrument);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.deleteInstrument = function (instrumentId) {
        var _a = this._getInstrumentState(), storeId = _a.storeId, customerId = _a.customerId, token = _a.token;
        var action = this._instrumentActionCreator.deleteInstrument(storeId, customerId, token, instrumentId);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype._getInstrumentState = function () {
        var checkout = this._store.getState().checkout;
        if (!checkout.getConfig() || !checkout.getCustomer() || !checkout.getCheckoutMeta()) {
            throw new errors_1.MissingDataError();
        }
        var customerId = checkout.getCustomer().customerId;
        var storeId = checkout.getConfig().storeId;
        var _a = checkout.getCheckoutMeta(), vaultAccessToken = _a.vaultAccessToken, vaultAccessExpiry = _a.vaultAccessExpiry;
        return {
            customerId: customerId,
            storeId: storeId,
            token: {
                vaultAccessToken: vaultAccessToken,
                vaultAccessExpiry: vaultAccessExpiry,
            },
        };
    };
    return CheckoutService;
}());
exports.default = CheckoutService;
//# sourceMappingURL=checkout-service.js.map