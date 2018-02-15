"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request_sender_1 = require("@bigcommerce/request-sender");
var order_1 = require("./order");
var payment_1 = require("./payment");
function createPlaceOrderService(store, client, paymentClient) {
    var requestSender = request_sender_1.createRequestSender();
    return new order_1.PlaceOrderService(store, new order_1.OrderActionCreator(client), new payment_1.PaymentActionCreator(new payment_1.PaymentRequestSender(paymentClient)), new payment_1.PaymentMethodActionCreator(new payment_1.PaymentMethodRequestSender(requestSender)));
}
exports.default = createPlaceOrderService;
//# sourceMappingURL=create-place-order-service.js.map