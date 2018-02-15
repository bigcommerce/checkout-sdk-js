"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = require("@bigcommerce/request-sender");
var customer_1 = require("./customer");
var remote_checkout_1 = require("./remote-checkout");
function createSignInCustomerService(store, client) {
    return new customer_1.SignInCustomerService(store, new customer_1.CustomerActionCreator(client), new remote_checkout_1.RemoteCheckoutActionCreator(new remote_checkout_1.RemoteCheckoutRequestSender(request_sender_1.createRequestSender())));
}
exports.default = createSignInCustomerService;
//# sourceMappingURL=create-sign-in-customer-service.js.map