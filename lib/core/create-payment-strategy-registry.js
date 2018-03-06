"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var form_poster_1 = require("form-poster");
var script_loader_1 = require("@bigcommerce/script-loader");
var strategies_1 = require("./payment/strategies");
var amazon_pay_1 = require("./remote-checkout/methods/amazon-pay");
var payment_1 = require("./payment");
var afterpay_1 = require("./remote-checkout/methods/afterpay");
var create_place_order_service_1 = require("./create-place-order-service");
var create_remote_checkout_service_1 = require("./create-remote-checkout-service");
var klarna_1 = require("./remote-checkout/methods/klarna");
function createPaymentStrategyRegistry(store, client, paymentClient) {
    var checkout = store.getState().checkout;
    var registry = new payment_1.PaymentStrategyRegistry(checkout.getConfig());
    var placeOrderService = create_place_order_service_1.default(store, client, paymentClient);
    var remoteCheckoutService = create_remote_checkout_service_1.default(store, client);
    var scriptLoader = script_loader_1.createScriptLoader();
    var afterpayScriptLoader = afterpay_1.createAfterpayScriptLoader();
    var klarnaScriptLoader = new klarna_1.default(scriptLoader);
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
    return registry;
}
exports.default = createPaymentStrategyRegistry;
//# sourceMappingURL=create-payment-strategy-registry.js.map