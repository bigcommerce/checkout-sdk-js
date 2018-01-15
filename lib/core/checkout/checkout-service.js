"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var errors_1 = require("../common/error/errors");
var errors_2 = require("../order/errors");
var CheckoutService = (function () {
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
        var action = this._quoteActionCreator.loadQuote(options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.loadCart = function (options) {
        var action = this._cartActionCreator.loadCart(options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.updateCart = function (cart) {
        var action = this._cartActionCreator.updateCart(cart);
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
        return this._paymentStrategyRegistry.getStrategyByMethod(method).execute(payload, options);
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
        return this._paymentStrategyRegistry.getStrategyByMethod(method).finalize(options);
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
        var method = checkout.getPaymentMethod(methodId, gatewayId);
        if (!method) {
            throw new errors_1.MissingDataError();
        }
        return this._paymentStrategyRegistry.getStrategyByMethod(method).initialize(options);
    };
    CheckoutService.prototype.deinitializePaymentMethod = function (methodId, gatewayId) {
        var checkout = this._store.getState().checkout;
        var method = checkout.getPaymentMethod(methodId, gatewayId);
        if (!method) {
            throw new errors_1.MissingDataError();
        }
        return this._paymentStrategyRegistry.getStrategyByMethod(method).deinitialize();
    };
    CheckoutService.prototype.loadBillingCountries = function (options) {
        var action = this._countryActionCreator.loadCountries(options);
        return this._store.dispatch(action, { queueId: 'billingCountries' });
    };
    CheckoutService.prototype.loadShippingCountries = function (options) {
        var action = this._shippingCountryActionCreator.loadCountries(options);
        return this._store.dispatch(action, { queueId: 'shippingCountries' });
    };
    CheckoutService.prototype.signInCustomer = function (credentials, options) {
        var action = this._customerActionCreator.signInCustomer(credentials, options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.signOutCustomer = function (options) {
        var action = this._customerActionCreator.signOutCustomer(options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.loadShippingOptions = function (options) {
        var action = this._shippingOptionActionCreator.loadShippingOptions(options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.selectShippingOption = function (addressId, shippingOptionId, options) {
        var action = this._shippingOptionActionCreator.selectShippingOption(addressId, shippingOptionId, options);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.updateShippingAddress = function (address, options) {
        var action = this._shippingAddressActionCreator.updateAddress(address, options);
        return this._store.dispatch(action);
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
        var checkout = this._store.getState().checkout;
        if (!checkout.getConfig() || !checkout.getCustomer()) {
            throw new errors_1.MissingDataError();
        }
        var storeId = checkout.getConfig().storeId;
        var customerId = checkout.getCustomer().customerId;
        var action = this._instrumentActionCreator.loadInstruments(storeId, customerId);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.vaultInstrument = function (instrument) {
        var checkout = this._store.getState().checkout;
        if (!checkout.getConfig() || !checkout.getCustomer()) {
            throw new errors_1.MissingDataError();
        }
        var storeId = checkout.getConfig().storeId;
        var customerId = checkout.getCustomer().customerId;
        var action = this._instrumentActionCreator.vaultInstrument(storeId, customerId, instrument);
        return this._store.dispatch(action);
    };
    CheckoutService.prototype.deleteInstrument = function (instrumentId) {
        var checkout = this._store.getState().checkout;
        if (!checkout.getConfig() || !checkout.getCustomer()) {
            throw new errors_1.MissingDataError();
        }
        var storeId = checkout.getConfig().storeId;
        var customerId = checkout.getCustomer().customerId;
        var action = this._instrumentActionCreator.deleteInstrument(storeId, customerId, instrumentId);
        return this._store.dispatch(action);
    };
    return CheckoutService;
}());
exports.default = CheckoutService;
//# sourceMappingURL=checkout-service.js.map