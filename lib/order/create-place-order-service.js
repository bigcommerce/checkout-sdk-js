"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = require("@bigcommerce/request-sender");
var cart_1 = require("../cart");
var payment_1 = require("../payment");
var order_action_creator_1 = require("./order-action-creator");
var place_order_service_1 = require("./place-order-service");
function createPlaceOrderService(store, client, paymentClient) {
    var requestSender = request_sender_1.createRequestSender();
    return new place_order_service_1.default(store, new cart_1.CartActionCreator(client), new order_action_creator_1.default(client), new payment_1.PaymentActionCreator(new payment_1.PaymentRequestSender(paymentClient)), new payment_1.PaymentMethodActionCreator(client));
}
exports.default = createPlaceOrderService;
//# sourceMappingURL=create-place-order-service.js.map