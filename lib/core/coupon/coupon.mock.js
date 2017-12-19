"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var carts_mock_1 = require("../cart/carts.mock");
function getCouponResponseBody() {
    return {
        data: {
            cart: carts_mock_1.getCart(),
        },
        meta: {},
    };
}
exports.getCouponResponseBody = getCouponResponseBody;
//# sourceMappingURL=coupon.mock.js.map