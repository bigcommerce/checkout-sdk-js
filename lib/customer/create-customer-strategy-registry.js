"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = require("@bigcommerce/request-sender");
var script_loader_1 = require("@bigcommerce/script-loader");
var amazon_pay_1 = require("../remote-checkout/methods/amazon-pay");
var strategies_1 = require("./strategies");
var registry_1 = require("../common/registry");
var remote_checkout_1 = require("../remote-checkout");
var create_sign_in_customer_service_1 = require("../customer/create-sign-in-customer-service");
function createCustomerStrategyRegistry(store, client) {
    var registry = new registry_1.Registry();
    var signInCustomerService = create_sign_in_customer_service_1.default(store, client);
    registry.register('amazon', function () {
        return new strategies_1.AmazonPayCustomerStrategy(store, signInCustomerService, new remote_checkout_1.RemoteCheckoutRequestSender(request_sender_1.createRequestSender()), new amazon_pay_1.AmazonPayScriptLoader(script_loader_1.getScriptLoader()));
    });
    registry.register('default', function () {
        return new strategies_1.DefaultCustomerStrategy(store, signInCustomerService);
    });
    return registry;
}
exports.default = createCustomerStrategyRegistry;
//# sourceMappingURL=create-customer-strategy-registry.js.map