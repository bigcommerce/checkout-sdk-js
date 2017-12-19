"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var checkout_1 = require("./checkout");
var create_checkout_service_1 = require("./create-checkout-service");
describe('createCheckoutService()', function () {
    it('creates an instance of CheckoutService', function () {
        var checkoutClient = jest.fn();
        var checkoutService = create_checkout_service_1.default({ client: checkoutClient });
        expect(checkoutService).toEqual(expect.any(checkout_1.CheckoutService));
    });
    it('creates an instance without optional params', function () {
        var checkoutService = create_checkout_service_1.default();
        expect(checkoutService).toEqual(expect.any(checkout_1.CheckoutService));
    });
});
//# sourceMappingURL=create-checkout-service.spec.js.map