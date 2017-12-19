"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var create_checkout_store_1 = require("./create-checkout-store");
var data_store_1 = require("../data-store/data-store");
describe('createCheckoutStore()', function () {
    it('returns an instance of CheckoutStore', function () {
        var store = create_checkout_store_1.default();
        expect(store).toEqual(expect.any(data_store_1.default));
    });
    it('creates CheckoutStore with expected reducers', function () {
        var store = create_checkout_store_1.default();
        expect(store.getState()).toEqual({
            checkout: expect.any(Object),
            errors: expect.any(Object),
            statuses: expect.any(Object),
        });
    });
});
//# sourceMappingURL=create-checkout-store.spec.js.map