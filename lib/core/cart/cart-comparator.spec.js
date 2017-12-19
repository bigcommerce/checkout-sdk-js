"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var carts_mock_1 = require("./carts.mock");
var cart_comparator_1 = require("./cart-comparator");
describe('CartComparator', function () {
    var comparator;
    beforeEach(function () {
        comparator = new cart_comparator_1.default();
    });
    describe('#isEqual()', function () {
        it('returns true if two carts are equal', function () {
            var cartA = carts_mock_1.getCart();
            var cartB = carts_mock_1.getCart();
            expect(comparator.isEqual(cartA, cartB)).toEqual(true);
        });
        it('returns false if two carts are not equal', function () {
            var cartA = carts_mock_1.getCart();
            var cartB = tslib_1.__assign({}, carts_mock_1.getCart(), { currency: 'JPY' });
            expect(comparator.isEqual(cartA, cartB)).toEqual(false);
        });
        it('returns true if two carts are only different in their ignored properties', function () {
            var cartA = carts_mock_1.getCart();
            var cartB = tslib_1.__assign({}, cartA, { items: [
                    tslib_1.__assign({}, cartA.items[0], { id: '22e11c8f-7dce-4da3-9413-b649533f8bad', imageUrl: '/images/canvas-laundry-cart-2.jpg' }),
                ] });
            expect(comparator.isEqual(cartA, cartB)).toEqual(true);
        });
    });
});
//# sourceMappingURL=cart-comparator.spec.js.map