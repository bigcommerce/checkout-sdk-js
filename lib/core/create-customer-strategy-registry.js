"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var strategies_1 = require("./customer/strategies");
var registry_1 = require("./common/registry");
var create_sign_in_customer_service_1 = require("./create-sign-in-customer-service");
function createCustomerStrategyRegistry(store, client) {
    var registry = new registry_1.Registry();
    var signInCustomerService = create_sign_in_customer_service_1.default(store, client);
    registry.register('default', function () {
        return new strategies_1.DefaultCustomerStrategy(store, signInCustomerService);
    });
    return registry;
}
exports.default = createCustomerStrategyRegistry;
//# sourceMappingURL=create-customer-strategy-registry.js.map