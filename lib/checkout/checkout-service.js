"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_1 = require("../common/error/errors");
var errors_2 = require("../order/errors");
var CheckoutService = (function () {
    function CheckoutService(store, customerStrategyRegistry, paymentStrategyRegistry, shippingStrategyRegistry, billingAddressActionCreator, cartActionCreator, configActionCreator, countryActionCreator, couponActionCreator, customerActionCreator, giftCertificateActionCreator, instrumentActionCreator, orderActionCreator, paymentMethodActionCreator, quoteActionCreator, shippingCountryActionCreator, shippingOptionActionCreator) {
        this._store = store;
        this._customerStrategyRegistry = customerStrategyRegistry;
        this._paymentStrategyRegistry = paymentStrategyRegistry;
        this._shippingStrategyRegistry = shippingStrategyRegistry;
        this._billingAddressActionCreator = billingAddressActionCreator;
        this._cartActionCreator = cartActionCreator;
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
        var checkout = this._store.getState().checkout;
        var _a = payload.payment, payment = _a === void 0 ? {} : _a;
        var method = checkout.getPaymentMethod(payment.name, payment.gateway);
        if (!method) {
            throw new errors_1.MissingDataError();
        }
        return this._paymentStrategyRegistry.getByMethod(method).execute(payload, options);
    };
    CheckoutService.prototype.finalizeOrder = function (orderId, options) {
        var action = this._orderActionCreator.finalizeOrder(orderId, options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.finalizeOrderIfNeeded = function (options) {
        var checkout = this._store.getState().checkout;
        var order = checkout.getOrder();
        if (!order) {
            throw new errors_1.MissingDataError();
        }
        if (!order.payment || !order.payment.id) {
            return Promise.reject(new errors_2.OrderFinalizationNotRequiredError());
        }
        var method = checkout.getPaymentMethod(order.payment.id, order.payment.gateway);
        if (!method) {
            throw new errors_1.MissingDataError();
        }
        return this._paymentStrategyRegistry.getByMethod(method).finalize(options);
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
        var checkout = this._store.getState().checkout;
        var paymentMethod = checkout.getPaymentMethod(methodId, gatewayId);
        if (!paymentMethod) {
            throw new errors_1.MissingDataError();
        }
        return this._paymentStrategyRegistry.getByMethod(paymentMethod)
            .initialize(tslib_1.__assign({}, options, { paymentMethod: paymentMethod }));
    };
    CheckoutService.prototype.deinitializePaymentMethod = function (methodId, gatewayId) {
        var checkout = this._store.getState().checkout;
        var method = checkout.getPaymentMethod(methodId, gatewayId);
        if (!method) {
            throw new errors_1.MissingDataError();
        }
        return this._paymentStrategyRegistry.getByMethod(method).deinitialize();
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
        var methodId = options.methodId;
        var strategy = this._customerStrategyRegistry.get(methodId);
        if (methodId) {
            return this.loadPaymentMethod(methodId)
                .then(function (_a) {
                var checkout = _a.checkout;
                return strategy.initialize(tslib_1.__assign({}, options, { paymentMethod: checkout.getPaymentMethod(methodId) }));
            });
        }
        return strategy.initialize(options);
    };
    CheckoutService.prototype.deinitializeCustomer = function (options) {
        if (options === void 0) { options = {}; }
        return this._customerStrategyRegistry.get(options.methodId)
            .deinitialize(options);
    };
    CheckoutService.prototype.signInCustomer = function (credentials, options) {
        if (options === void 0) { options = {}; }
        return this._customerStrategyRegistry.get(options.methodId)
            .signIn(credentials, options);
    };
    CheckoutService.prototype.signOutCustomer = function (options) {
        if (options === void 0) { options = {}; }
        return this._customerStrategyRegistry.get(options.methodId)
            .signOut(options);
    };
    CheckoutService.prototype.loadShippingOptions = function (options) {
        var action = this._shippingOptionActionCreator.loadShippingOptions(options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.initializeShipping = function (options) {
        var _this = this;
        var _a = (this._store.getState().checkout.getCustomer() || {}).remote, remote = _a === void 0 ? {} : _a;
        if (remote.provider) {
            return this.loadPaymentMethod(remote.provider)
                .then(function () {
                var paymentMethod = _this._store.getState().checkout.getPaymentMethod(remote.provider);
                return _this._shippingStrategyRegistry.get(remote.provider)
                    .initialize(tslib_1.__assign({}, options, { paymentMethod: paymentMethod }));
            });
        }
        return this._shippingStrategyRegistry.get().initialize(options);
    };
    CheckoutService.prototype.deinitializeShipping = function (options) {
        var _a = (this._store.getState().checkout.getCustomer() || {}).remote, remote = _a === void 0 ? {} : _a;
        return this._shippingStrategyRegistry.get(remote.provider).deinitialize(options);
    };
    CheckoutService.prototype.selectShippingOption = function (addressId, shippingOptionId, options) {
        var checkout = this._store.getState().checkout;
        var _a = (checkout.getCustomer() || {}).remote, remote = _a === void 0 ? {} : _a;
        return this._shippingStrategyRegistry.get(remote.provider)
            .selectOption(addressId, shippingOptionId, options);
    };
    CheckoutService.prototype.updateShippingAddress = function (address, options) {
        var checkout = this._store.getState().checkout;
        var _a = (checkout.getCustomer() || {}).remote, remote = _a === void 0 ? {} : _a;
        return this._shippingStrategyRegistry.get(remote.provider)
            .updateAddress(address, options);
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