"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var checkout_1 = require("./checkout");
var create_checkout_client_1 = require("./create-checkout-client");
describe('createCheckoutClient()', function () {
    it('creates an instance of CheckoutClient', function () {
        var checkoutClient = create_checkout_client_1.default();
        expect(checkoutClient).toEqual(expect.any(checkout_1.CheckoutClient));
    });
});
//# sourceMappingURL=create-checkout-client.spec.js.map