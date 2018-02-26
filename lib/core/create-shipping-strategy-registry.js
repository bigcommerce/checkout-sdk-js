"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var amazon_pay_1 = require("./remote-checkout/methods/amazon-pay");
var strategies_1 = require("./shipping/strategies");
var registry_1 = require("./common/registry");
var script_loader_1 = require("./../script-loader");
var create_update_shipping_service_1 = require("./create-update-shipping-service");
var create_remote_checkout_service_1 = require("./create-remote-checkout-service");
function createShippingStrategyRegistry(store, client) {
    var registry = new registry_1.Registry();
    var updateShippingService = create_update_shipping_service_1.default(store, client);
    var remoteCheckoutService = create_remote_checkout_service_1.default(store, client);
    registry.register('amazon', function () {
        return new strategies_1.AmazonPayShippingStrategy(store, updateShippingService, remoteCheckoutService, new amazon_pay_1.AmazonPayScriptLoader(script_loader_1.createScriptLoader()));
    });
    registry.register('default', function () {
        return new strategies_1.DefaultShippingStrategy(store, updateShippingService);
    });
    return registry;
}
exports.default = createShippingStrategyRegistry;
//# sourceMappingURL=create-shipping-strategy-registry.js.map