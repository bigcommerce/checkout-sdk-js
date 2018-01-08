"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var PlaceOrderService = (function () {
    function PlaceOrderService(store, orderActionCreator, paymentActionCreator) {
        this._store = store;
        this._orderActionCreator = orderActionCreator;
        this._paymentActionCreator = paymentActionCreator;
    }
    PlaceOrderService.prototype.submitOrder = function (payload, shouldVerifyCart, options) {
        if (shouldVerifyCart === void 0) { shouldVerifyCart = false; }
        var checkout = this._store.getState().checkout;
        var action = this._orderActionCreator.submitOrder(payload, shouldVerifyCart ? checkout.getCart() : undefined, options);
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
        return {
            authToken: checkout.getCheckoutMeta().paymentAuthToken,
            billingAddress: checkout.getBillingAddress(),
            cart: checkout.getCart(),
            customer: checkout.getCustomer(),
            order: checkout.getOrder(),
            orderMeta: lodash_1.pick(checkout.getCheckoutMeta(), [
                'deviceFingerprint',
            ]),
            payment: lodash_1.omit(payment.paymentData, ['deviceSessionId']),
            paymentMethod: checkout.getPaymentMethod(payment.name, payment.gateway),
            quoteMeta: {
                request: tslib_1.__assign({}, lodash_1.pick(checkout.getCheckoutMeta(), [
                    'geoCountryCode',
                    'sessionHash',
                ]), { deviceSessionId: deviceSessionId }),
            },
            shippingAddress: checkout.getShippingAddress(),
            shippingOption: checkout.getSelectedShippingOption(),
            source: payment.source || 'bcapp-checkout-uco',
            store: lodash_1.pick(checkout.getConfig(), [
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