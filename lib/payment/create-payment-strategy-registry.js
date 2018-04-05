"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var form_poster_1 = require("@bigcommerce/form-poster");
var request_sender_1 = require("@bigcommerce/request-sender");
var script_loader_1 = require("@bigcommerce/script-loader");
var billing_1 = require("../billing");
var order_1 = require("../order");
var remote_checkout_1 = require("../remote-checkout");
var afterpay_1 = require("../remote-checkout/methods/afterpay");
var amazon_pay_1 = require("../remote-checkout/methods/amazon-pay");
var klarna_1 = require("../remote-checkout/methods/klarna");
var payment_strategy_registry_1 = require("./payment-strategy-registry");
var strategies_1 = require("./strategies");
var braintree_1 = require("./strategies/braintree");
function createPaymentStrategyRegistry(store, client, paymentClient) {
    var checkout = store.getState().checkout;
    var registry = new payment_strategy_registry_1.default(checkout.getConfig());
    var placeOrderService = order_1.createPlaceOrderService(store, client, paymentClient);
    var scriptLoader = script_loader_1.getScriptLoader();
    var remoteCheckoutActionCreator = new remote_checkout_1.RemoteCheckoutActionCreator(new remote_checkout_1.RemoteCheckoutRequestSender(request_sender_1.createRequestSender()));
    registry.register('afterpay', function () {
        return new strategies_1.AfterpayPaymentStrategy(store, placeOrderService, remoteCheckoutActionCreator, afterpay_1.createAfterpayScriptLoader());
    });
    registry.register('amazon', function () {
        return new strategies_1.AmazonPayPaymentStrategy(store, placeOrderService, new billing_1.BillingAddressActionCreator(client), remoteCheckoutActionCreator, new amazon_pay_1.AmazonPayScriptLoader(scriptLoader));
    });
    registry.register('creditcard', function () {
        return new strategies_1.CreditCardPaymentStrategy(store, placeOrderService);
    });
    registry.register('klarna', function () {
        return new strategies_1.KlarnaPaymentStrategy(store, placeOrderService, remoteCheckoutActionCreator, new klarna_1.KlarnaScriptLoader(scriptLoader));
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
    registry.register('nopaymentdatarequired', function () {
        return new strategies_1.NoPaymentDataRequiredPaymentStrategy(store, placeOrderService);
    });
    registry.register('braintree', function () {
        return new strategies_1.BraintreeCreditCardPaymentStrategy(store, placeOrderService, braintree_1.createBraintreePaymentProcessor(scriptLoader));
    });
    return registry;
}
exports.default = createPaymentStrategyRegistry;
//# sourceMappingURL=create-payment-strategy-registry.js.map