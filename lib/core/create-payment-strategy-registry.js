"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var form_poster_1 = require("form-poster");
var strategies_1 = require("./payment/strategies");
var payment_1 = require("./payment");
var script_loader_1 = require("../script-loader");
/**
 * @param {DataStore} store
 * @param {PlaceOrderService} placeOrderService
 * @return {PaymentStrategyRegistry}
 */
function createPaymentStrategyRegistry(store, placeOrderService) {
    var checkout = store.getState().checkout;
    var registry = new payment_1.PaymentStrategyRegistry(checkout.getConfig());
    var scriptLoader = script_loader_1.createScriptLoader();
    registry.addStrategy('creditcard', new strategies_1.CreditCardPaymentStrategy(store, placeOrderService));
    registry.addStrategy('legacy', new strategies_1.LegacyPaymentStrategy(store, placeOrderService));
    registry.addStrategy('offline', new strategies_1.OfflinePaymentStrategy(store, placeOrderService));
    registry.addStrategy('offsite', new strategies_1.OffsitePaymentStrategy(store, placeOrderService));
    registry.addStrategy('paypalexpress', new strategies_1.PaypalExpressPaymentStrategy(store, placeOrderService, scriptLoader));
    registry.addStrategy('paypalexpresscredit', new strategies_1.PaypalExpressPaymentStrategy(store, placeOrderService, scriptLoader));
    registry.addStrategy('sagepay', new strategies_1.SagePayPaymentStrategy(store, placeOrderService, form_poster_1.createFormPoster()));
    return registry;
}
exports.default = createPaymentStrategyRegistry;
//# sourceMappingURL=create-payment-strategy-registry.js.map