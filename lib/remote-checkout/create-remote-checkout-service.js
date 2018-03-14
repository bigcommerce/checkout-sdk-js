"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = require("@bigcommerce/request-sender");
var shipping_1 = require("../shipping");
var billing_1 = require("../billing");
var remote_checkout_action_creator_1 = require("./remote-checkout-action-creator");
var remote_checkout_request_sender_1 = require("./remote-checkout-request-sender");
var remote_checkout_service_1 = require("./remote-checkout-service");
function createRemoteCheckoutService(store, client) {
    return new remote_checkout_service_1.default(store, new billing_1.BillingAddressActionCreator(client), new shipping_1.ShippingAddressActionCreator(client), new remote_checkout_action_creator_1.default(new remote_checkout_request_sender_1.default(request_sender_1.createRequestSender())));
}
exports.default = createRemoteCheckoutService;
//# sourceMappingURL=create-remote-checkout-service.js.map