"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var errors_1 = require("../common/error/errors");
var PlaceOrderService = (function () {
    function PlaceOrderService(store, orderActionCreator, paymentActionCreator) {
        this._store = store;
        this._orderActionCreator = orderActionCreator;
        this._paymentActionCreator = paymentActionCreator;
    }
    PlaceOrderService.prototype.submitOrder = function (payload, shouldVerifyCart, options) {
        if (shouldVerifyCart === void 0) { shouldVerifyCart = false; }
        var checkout = this._store.getState().checkout;
        var cart = checkout.getCart();
        if (!cart) {
            throw new errors_1.MissingDataError();
        }
        var action = this._orderActionCreator.submitOrder(payload, shouldVerifyCart ? cart : undefined, options);
        return this._store.dispatch(action);
    };
    PlaceOrderService.prototype.finalizeOrder = function (orderId, options) {
        return this._store.dispatch(this._orderActionCreator.finalizeOrder(orderId, options));
    };
    PlaceOrderService.prototype.submitPayment = function (payment, useStoreCredit, options) {
        var _this = this;
        if (useStoreCredit === void 0) { useStoreCredit = false; }
        if (!this._shouldSubmitPayment(useStoreCredit)) {
            return Promise.resolve(this._store.getState());
        }
        var payload = this._getPaymentRequestBody(payment);
        return this._store.dispatch(this._paymentActionCreator.submitPayment(payload, options))
            .then(function (_a) {
            var checkout = _a.checkout;
            var orderId = checkout.getOrder().orderId;
            return _this._store.dispatch(_this._orderActionCreator.loadOrder(orderId, options));
        });
    };
    PlaceOrderService.prototype.initializeOffsitePayment = function (payment, useStoreCredit, options) {
        if (useStoreCredit === void 0) { useStoreCredit = false; }
        if (!this._shouldSubmitPayment(useStoreCredit)) {
            return Promise.resolve(this._store.getState());
        }
        var payload = this._getPaymentRequestBody(payment);
        return this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment(payload, options));
    };
    PlaceOrderService.prototype._shouldSubmitPayment = function (useStoreCredit) {
        var checkout = this._store.getState().checkout;
        return checkout.isPaymentDataRequired(useStoreCredit);
    };
    PlaceOrderService.prototype._getPaymentRequestBody = function (payment) {
        var checkout = this._store.getState().checkout;
        var deviceSessionId = payment.paymentData && payment.paymentData.deviceSessionId || checkout.getCheckoutMeta().deviceSessionId;
        var checkoutMeta = checkout.getCheckoutMeta();
        var billingAddress = checkout.getBillingAddress();
        var cart = checkout.getCart();
        var customer = checkout.getCustomer();
        var order = checkout.getOrder();
        var paymentMethod = checkout.getPaymentMethod(payment.name, payment.gateway);
        var shippingAddress = checkout.getShippingAddress();
        var shippingOption = checkout.getSelectedShippingOption();
        var config = checkout.getConfig();
        if (!checkoutMeta || !billingAddress || !cart || !customer || !order ||
            !paymentMethod || !shippingAddress || !shippingOption || !config) {
            throw new errors_1.MissingDataError();
        }
        return {
            billingAddress: billingAddress,
            cart: cart,
            customer: customer,
            order: order,
            paymentMethod: paymentMethod,
            shippingAddress: shippingAddress,
            shippingOption: shippingOption,
            authToken: checkoutMeta.paymentAuthToken,
            orderMeta: lodash_1.pick(checkoutMeta, ['deviceFingerprint']),
            payment: lodash_1.omit(payment.paymentData, ['deviceSessionId']),
            quoteMeta: {
                request: tslib_1.__assign({}, lodash_1.pick(checkoutMeta, [
                    'geoCountryCode',
                    'sessionHash',
                ]), { deviceSessionId: deviceSessionId }),
            },
            source: payment.source || 'bcapp-checkout-uco',
            store: lodash_1.pick(config, [
                'storeHash',
                'storeId',
                'storeLanguage',
                'storeName',
            ]),
        };
    };
    return PlaceOrderService;
}());
exports.default = PlaceOrderService;
//# sourceMappingURL=place-order-service.js.map