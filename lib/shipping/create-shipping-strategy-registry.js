"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = require("@bigcommerce/request-sender");
var script_loader_1 = require("@bigcommerce/script-loader");
var registry_1 = require("../common/registry");
var payment_1 = require("../payment");
var remote_checkout_1 = require("../remote-checkout");
var amazon_pay_1 = require("../remote-checkout/methods/amazon-pay");
var shipping_address_action_creator_1 = require("./shipping-address-action-creator");
var shipping_option_action_creator_1 = require("./shipping-option-action-creator");
var strategies_1 = require("./strategies");
function createShippingStrategyRegistry(store, client) {
    var registry = new registry_1.Registry();
    registry.register('amazon', function () {
        return new strategies_1.AmazonPayShippingStrategy(store, new shipping_address_action_creator_1.default(client), new shipping_option_action_creator_1.default(client), new payment_1.PaymentMethodActionCreator(client), new remote_checkout_1.RemoteCheckoutActionCreator(new remote_checkout_1.RemoteCheckoutRequestSender(request_sender_1.createRequestSender())), new amazon_pay_1.AmazonPayScriptLoader(script_loader_1.getScriptLoader()));
    });
    registry.register('default', function () {
        return new strategies_1.DefaultShippingStrategy(store, new shipping_address_action_creator_1.default(client), new shipping_option_action_creator_1.default(client));
    });
    return registry;
}
exports.default = createShippingStrategyRegistry;
//# sourceMappingURL=create-shipping-strategy-registry.js.map