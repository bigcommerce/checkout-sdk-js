"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shipping_action_creator_1 = require("./shipping-action-creator");
var shipping_address_action_creator_1 = require("./shipping-address-action-creator");
var shipping_option_action_creator_1 = require("./shipping-option-action-creator");
var update_shipping_service_1 = require("./update-shipping-service");
function createUpdateShippingService(store, client) {
    return new update_shipping_service_1.default(store, new shipping_address_action_creator_1.default(client), new shipping_option_action_creator_1.default(client), new shipping_action_creator_1.default());
}
exports.default = createUpdateShippingService;
//# sourceMappingURL=create-update-shipping-service.js.map