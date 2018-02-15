"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var strategies_1 = require("./shipping/strategies");
var registry_1 = require("./common/registry");
var create_update_shipping_service_1 = require("./create-update-shipping-service");
var create_remote_checkout_service_1 = require("./create-remote-checkout-service");
function createShippingStrategyRegistry(store, client) {
    var registry = new registry_1.Registry();
    var updateShippingService = create_update_shipping_service_1.default(store, client);
    var remoteCheckoutService = create_remote_checkout_service_1.default(store, client);
    registry.register('default', function () {
        return new strategies_1.DefaultShippingStrategy(store, updateShippingService);
    });
    return registry;
}
exports.default = createShippingStrategyRegistry;
//# sourceMappingURL=create-shipping-strategy-registry.js.map