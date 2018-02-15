"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = require("@bigcommerce/request-sender");
var remote_checkout_1 = require("./remote-checkout");
var shipping_1 = require("./shipping");
var billing_1 = require("./billing");
function createRemoteCheckoutService(store, client) {
    return new remote_checkout_1.RemoteCheckoutService(store, new billing_1.BillingAddressActionCreator(client), new shipping_1.ShippingAddressActionCreator(client), new remote_checkout_1.RemoteCheckoutActionCreator(new remote_checkout_1.RemoteCheckoutRequestSender(request_sender_1.createRequestSender())));
}
exports.default = createRemoteCheckoutService;
//# sourceMappingURL=create-remote-checkout-service.js.map