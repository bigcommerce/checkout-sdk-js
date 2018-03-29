"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var errors_1 = require("../common/error/errors");
var PlaceOrderService = (function () {
    function PlaceOrderService(store, cartActionCreator, orderActionCreator, paymentActionCreator, paymentMethodActionCreator) {
        this._store = store;
        this._cartActionCreator = cartActionCreator;
        this._orderActionCreator = orderActionCreator;
        this._paymentActionCreator = paymentActionCreator;
        this._paymentMethodActionCreator = paymentMethodActionCreator;
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
    PlaceOrderService.prototype.verifyCart = function (options) {
        var checkout = this._store.getState().checkout;
        var action = this._cartActionCreator.verifyCart(checkout.getCart(), options);
        return this._store.dispatch(action);
    };
    PlaceOrderService.prototype.finalizeOrder = function (orderId, options) {
        return this._store.dispatch(this._orderActionCreator.finalizeOrder(orderId, options));
    };
    PlaceOrderService.prototype.submitPayment = function (payment, useStoreCredit, options) {
        var _this = this;
        if (useStoreCredit === void 0) { useStoreCredit = false; }
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
        var payload = this._getPaymentRequestBody(payment);
        return this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment(payload, options));
    };
    PlaceOrderService.prototype.loadPaymentMethod = function (methodId, options) {
        var action = this._paymentMethodActionCreator.loadPaymentMethod(methodId, options);
        return this._store.dispatch(action, { queueId: 'paymentMethods' });
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
        var authToken = payment.paymentData && payment.paymentData.instrumentId
            ? checkoutMeta.paymentAuthToken + ", " + checkoutMeta.vaultAccessToken
            : checkoutMeta.paymentAuthToken;
        return {
            billingAddress: billingAddress,
            cart: cart,
            customer: customer,
            order: order,
            paymentMethod: this._getRequestPaymentMethod(paymentMethod),
            shippingAddress: shippingAddress,
            shippingOption: shippingOption,
            authToken: authToken,
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
    PlaceOrderService.prototype._getRequestPaymentMethod = function (paymentMethod) {
        return (paymentMethod.method === 'multi-option' && !paymentMethod.gateway) ? tslib_1.__assign({}, paymentMethod, { gateway: paymentMethod.id }) :
            paymentMethod;
    };
    return PlaceOrderService;
}());
exports.default = PlaceOrderService;
//# sourceMappingURL=place-order-service.js.map