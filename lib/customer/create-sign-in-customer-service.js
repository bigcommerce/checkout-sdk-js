"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = require("@bigcommerce/request-sender");
var remote_checkout_1 = require("../remote-checkout");
var customer_action_creator_1 = require("./customer-action-creator");
var sign_in_customer_service_1 = require("./sign-in-customer-service");
function createSignInCustomerService(store, client) {
    return new sign_in_customer_service_1.default(store, new customer_action_creator_1.default(client), new remote_checkout_1.RemoteCheckoutActionCreator(new remote_checkout_1.RemoteCheckoutRequestSender(request_sender_1.createRequestSender())));
}
exports.default = createSignInCustomerService;
//# sourceMappingURL=create-sign-in-customer-service.js.map