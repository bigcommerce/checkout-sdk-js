"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var order_summaries_mock_1 = require("../order/order-summaries.mock");
function getCart() {
    return order_summaries_mock_1.getOrderSummary();
}
exports.getCart = getCart;
function getCartMeta() {
    return {
        request: {
            geoCountryCode: 'AU',
            deviceSessionId: 'a37230e9a8e4ea2d7765e2f3e19f7b1d',
            sessionHash: 'cfbbbac580a920b395571fe086db1e06',
        },
    };
}
exports.getCartMeta = getCartMeta;
function getCartResponseBody() {
    return {
        data: {
            cart: getCart(),
        },
        meta: getCartMeta(),
    };
}
exports.getCartResponseBody = getCartResponseBody;
function getCartState() {
    return {
        data: getCart(),
        meta: getCartMeta(),
    };
}
exports.getCartState = getCartState;
//# sourceMappingURL=carts.mock.js.map