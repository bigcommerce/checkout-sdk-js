"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var carts_mock_1 = require("../cart/carts.mock");
function getGiftCertificateResponseBody() {
    return {
        data: {
            cart: carts_mock_1.getCart(),
        },
        meta: {},
    };
}
exports.getGiftCertificateResponseBody = getGiftCertificateResponseBody;
//# sourceMappingURL=gift-certificate.mock.js.map