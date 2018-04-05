"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = require("@bigcommerce/request-sender");
var script_loader_1 = require("@bigcommerce/script-loader");
var registry_1 = require("../common/registry");
var payment_1 = require("../payment");
var remote_checkout_1 = require("../remote-checkout");
var amazon_pay_1 = require("../remote-checkout/methods/amazon-pay");
var customer_action_creator_1 = require("./customer-action-creator");
var strategies_1 = require("./strategies");
function createCustomerStrategyRegistry(store, client) {
    var registry = new registry_1.Registry();
    var remoteCheckoutRequestSender = new remote_checkout_1.RemoteCheckoutRequestSender(request_sender_1.createRequestSender());
    registry.register('amazon', function () {
        return new strategies_1.AmazonPayCustomerStrategy(store, new payment_1.PaymentMethodActionCreator(client), new remote_checkout_1.RemoteCheckoutActionCreator(remoteCheckoutRequestSender), remoteCheckoutRequestSender, new amazon_pay_1.AmazonPayScriptLoader(script_loader_1.getScriptLoader()));
    });
    registry.register('default', function () {
        return new strategies_1.DefaultCustomerStrategy(store, new customer_action_creator_1.default(client));
    });
    return registry;
}
exports.default = createCustomerStrategyRegistry;
//# sourceMappingURL=create-customer-strategy-registry.js.map