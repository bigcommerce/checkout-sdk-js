"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var form_poster_1 = require("@bigcommerce/form-poster");
var script_loader_1 = require("@bigcommerce/script-loader");
var strategies_1 = require("./strategies");
var amazon_pay_1 = require("../remote-checkout/methods/amazon-pay");
var klarna_1 = require("../remote-checkout/methods/klarna");
var afterpay_1 = require("../remote-checkout/methods/afterpay");
var remote_checkout_1 = require("../remote-checkout");
var order_1 = require("../order");
var square_1 = require("./strategies/square");
var payment_strategy_registry_1 = require("./payment-strategy-registry");
function createPaymentStrategyRegistry(store, client, paymentClient) {
    var checkout = store.getState().checkout;
    var registry = new payment_strategy_registry_1.default(checkout.getConfig());
    var placeOrderService = order_1.createPlaceOrderService(store, client, paymentClient);
    var remoteCheckoutService = remote_checkout_1.createRemoteCheckoutService(store, client);
    var scriptLoader = script_loader_1.getScriptLoader();
    var afterpayScriptLoader = afterpay_1.createAfterpayScriptLoader();
    var klarnaScriptLoader = new klarna_1.KlarnaScriptLoader(scriptLoader);
    var squareScriptLoader = new square_1.SquareScriptLoader(scriptLoader);
    registry.register('afterpay', function () {
        return new strategies_1.AfterpayPaymentStrategy(store, placeOrderService, remoteCheckoutService, afterpayScriptLoader);
    });
    registry.register('amazon', function () {
        return new strategies_1.AmazonPayPaymentStrategy(store, placeOrderService, remoteCheckoutService, new amazon_pay_1.AmazonPayScriptLoader(scriptLoader));
    });
    registry.register('creditcard', function () {
        return new strategies_1.CreditCardPaymentStrategy(store, placeOrderService);
    });
    registry.register('klarna', function () {
        return new strategies_1.KlarnaPaymentStrategy(store, placeOrderService, remoteCheckoutService, klarnaScriptLoader);
    });
    registry.register('legacy', function () {
        return new strategies_1.LegacyPaymentStrategy(store, placeOrderService);
    });
    registry.register('offline', function () {
        return new strategies_1.OfflinePaymentStrategy(store, placeOrderService);
    });
    registry.register('offsite', function () {
        return new strategies_1.OffsitePaymentStrategy(store, placeOrderService);
    });
    registry.register('paypal', function () {
        return new strategies_1.PaypalProPaymentStrategy(store, placeOrderService);
    });
    registry.register('paypalexpress', function () {
        return new strategies_1.PaypalExpressPaymentStrategy(store, placeOrderService, scriptLoader);
    });
    registry.register('paypalexpresscredit', function () {
        return new strategies_1.PaypalExpressPaymentStrategy(store, placeOrderService, scriptLoader);
    });
    registry.register('sagepay', function () {
        return new strategies_1.SagePayPaymentStrategy(store, placeOrderService, form_poster_1.createFormPoster());
    });
    registry.register('squarev2', function () {
        return new strategies_1.SquarePaymentStrategy(store, placeOrderService, squareScriptLoader);
    });
    return registry;
}
exports.default = createPaymentStrategyRegistry;
//# sourceMappingURL=create-payment-strategy-registry.js.map