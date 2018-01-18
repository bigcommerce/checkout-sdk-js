"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var form_poster_1 = require("form-poster");
var strategies_1 = require("./payment/strategies");
var payment_1 = require("./payment");
var script_loader_1 = require("../script-loader");
function createPaymentStrategyRegistry(store, placeOrderService) {
    var checkout = store.getState().checkout;
    var registry = new payment_1.PaymentStrategyRegistry(checkout.getConfig());
    var scriptLoader = script_loader_1.createScriptLoader();
    registry.register('creditcard', function (method) { return new strategies_1.CreditCardPaymentStrategy(method, store, placeOrderService); });
    registry.register('legacy', function (method) { return new strategies_1.LegacyPaymentStrategy(method, store, placeOrderService); });
    registry.register('offline', function (method) { return new strategies_1.OfflinePaymentStrategy(method, store, placeOrderService); });
    registry.register('offsite', function (method) { return new strategies_1.OffsitePaymentStrategy(method, store, placeOrderService); });
    registry.register('paypal', function (method) { return new strategies_1.PaypalProPaymentStrategy(method, store, placeOrderService); });
    registry.register('paypalexpress', function (method) { return new strategies_1.PaypalExpressPaymentStrategy(method, store, placeOrderService, scriptLoader); });
    registry.register('paypalexpresscredit', function (method) { return new strategies_1.PaypalExpressPaymentStrategy(method, store, placeOrderService, scriptLoader); });
    registry.register('sagepay', function (method) { return new strategies_1.SagePayPaymentStrategy(method, store, placeOrderService, form_poster_1.createFormPoster()); });
    return registry;
}
exports.default = createPaymentStrategyRegistry;
//# sourceMappingURL=create-payment-strategy-registry.js.map