"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var PlaceOrderService = /** @class */ (function () {
    /**
     * @constructor
     * @param {DataStore} store
     * @param {OrderActionCreator} orderActionCreator
     * @param {PaymentActionCreator} paymentActionCreator
     */
    function PlaceOrderService(store, orderActionCreator, paymentActionCreator) {
        this._store = store;
        this._orderActionCreator = orderActionCreator;
        this._paymentActionCreator = paymentActionCreator;
    }
    /**
     * @todo Remove `shouldVerifyCart` flag in the future. Always verify cart by default
     * @param {OrderRequestBody} payload
     * @param {boolean} [shouldVerifyCart=false]
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    PlaceOrderService.prototype.submitOrder = function (payload, shouldVerifyCart, options) {
        if (shouldVerifyCart === void 0) { shouldVerifyCart = false; }
        var checkout = this._store.getState().checkout;
        var action = this._orderActionCreator.submitOrder(payload, shouldVerifyCart ? checkout.getCart() : undefined, options);
        return this._store.dispatch(action);
    };
    /**
     * @param {number} orderId
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    PlaceOrderService.prototype.finalizeOrder = function (orderId, options) {
        return this._store.dispatch(this._orderActionCreator.finalizeOrder(orderId, options));
    };
    /**
     * @param {Payment} payment
     * @param {boolean} [useStoreCredit=false]
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    PlaceOrderService.prototype.submitPayment = function (payment, useStoreCredit, options) {
        var _this = this;
        if (useStoreCredit === void 0) { useStoreCredit = false; }
        var checkout = this._store.getState().checkout;
        if (!checkout.isPaymentRequired(useStoreCredit)) {
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
    /**
     * @param {Payment} payment
     * @param {boolean} [useStoreCredit=false]
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    PlaceOrderService.prototype.initializeOffsitePayment = function (payment, useStoreCredit, options) {
        if (useStoreCredit === void 0) { useStoreCredit = false; }
        var checkout = this._store.getState().checkout;
        if (!checkout.isPaymentRequired(useStoreCredit)) {
            return Promise.resolve(this._store.getState());
        }
        var payload = this._getPaymentRequestBody(payment);
        return this._store.dispatch(this._paymentActionCreator.initializeOffsitePayment(payload, options));
    };
    /**
     * @private
     * @param {Payment} payment
     * @return {PaymentRequestBody}
     */
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