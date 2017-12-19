"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var utility_1 = require("../common/utility");
var carts_mock_1 = require("../cart/carts.mock");
var order_summary_selector_mixin_1 = require("./order-summary-selector-mixin");
describe('OrderSummarySelectorMixin', function () {
    var Selector = /** @class */ (function () {
        function Selector(summary) {
            this._summary = summary;
        }
        return Selector;
    }());
    beforeEach(function () {
        utility_1.applyMixin(Selector, order_summary_selector_mixin_1.default);
    });
    describe('#getItems()', function () {
        it('returns a list of items', function () {
            var selector = new Selector(carts_mock_1.getCart());
            expect(selector.getItems()).toEqual(carts_mock_1.getCart().items);
        });
        it('returns an empty array if no data was set', function () {
            var selector = new Selector({});
            expect(selector.getItems()).toEqual([]);
        });
    });
    describe('#getItemsCount()', function () {
        it('returns a valid count', function () {
            var selector = new Selector(carts_mock_1.getCart());
            expect(selector.getItemsCount()).toEqual(1);
        });
        it('returns 0 if the items list is empty', function () {
            var selector = new Selector(tslib_1.__assign({}, carts_mock_1.getCart(), { items: [] }));
            expect(selector.getItemsCount()).toEqual(0);
        });
        it('returns 0 if no data was set', function () {
            var selector = new Selector({});
            expect(selector.getItemsCount()).toEqual(0);
        });
    });
    describe('#getGrandTotal()', function () {
        it('returns the grand total', function () {
            var selector = new Selector(carts_mock_1.getCart());
            expect(selector.getGrandTotal()).toEqual(200);
        });
        it('returns 0 if the grand total is not set', function () {
            var selector = new Selector({});
            expect(selector.getGrandTotal()).toEqual(0);
        });
    });
    describe('#getSubtotal()', function () {
        it('returns the subtotal', function () {
            var selector = new Selector(carts_mock_1.getCart());
            expect(selector.getSubtotal()).toEqual(200);
        });
        it('returns 0 if the subtotal is not set', function () {
            var selector = new Selector({});
            expect(selector.getSubtotal()).toEqual(0);
        });
    });
    describe('#getHandlingFee()', function () {
        it('returns the handling fee', function () {
            var selector = new Selector(carts_mock_1.getCart());
            expect(selector.getHandlingFee()).toEqual(8);
        });
        it('returns 0 if the handling fee is not set', function () {
            var selector = new Selector({});
            expect(selector.getHandlingFee()).toEqual(0);
        });
    });
    describe('#getTaxes()', function () {
        it('returns the taxes', function () {
            var selector = new Selector(carts_mock_1.getCart());
            expect(selector.getTaxes()).toEqual(carts_mock_1.getCart().taxes);
        });
        it('returns an empty array if the taxes are not set', function () {
            var selector = new Selector({});
            expect(selector.getTaxes()).toEqual([]);
        });
    });
    describe('#getDiscount()', function () {
        it('returns the discount', function () {
            var selector = new Selector(carts_mock_1.getCart());
            expect(selector.getDiscount()).toEqual(10.00);
        });
        it('returns 0 if discount is not set', function () {
            var selector = new Selector({});
            expect(selector.getDiscount()).toEqual(0);
        });
    });
    describe('#getCoupon()', function () {
        it('returns the coupon object', function () {
            var selector = new Selector(carts_mock_1.getCart());
            expect(selector.getCoupons()).toEqual(carts_mock_1.getCart().coupon.coupons);
        });
        it('returns an empty array if no coupons are defined', function () {
            var selector = new Selector({});
            expect(selector.getCoupons()).toEqual([]);
        });
    });
    describe('#getCouponsDiscountedAmount()', function () {
        it('returns the discounted amount after applying coupons', function () {
            var selector = new Selector(carts_mock_1.getCart());
            expect(selector.getCouponsDiscountedAmount()).toEqual(5);
        });
        it('returns 0 if no coupons are defined', function () {
            var selector = new Selector({});
            expect(selector.getCouponsDiscountedAmount()).toEqual(0);
        });
    });
    describe('#getGiftCertificates()', function () {
        it('returns the gift certificates', function () {
            var selector = new Selector(carts_mock_1.getCart());
            expect(selector.getGiftCertificates()).toEqual(carts_mock_1.getCart().giftCertificate.appliedGiftCertificates);
        });
        it('returns an empty array if no gift certificates are defined', function () {
            var selector = new Selector({});
            expect(selector.getGiftCertificates()).toEqual([]);
        });
    });
    describe('#getShippingCost()', function () {
        it('returns the shipping cost before discount', function () {
            var selector = new Selector(carts_mock_1.getCart());
            expect(selector.getShippingCost()).toEqual(20);
        });
        it('returns 0 if the shipping cost is not set', function () {
            var selector = new Selector({});
            expect(selector.getShippingCost()).toEqual(0);
        });
    });
    describe('#isShippingRequired()', function () {
        it('returns true if shipping is required', function () {
            var selector = new Selector(carts_mock_1.getCart());
            expect(selector.isShippingRequired()).toEqual(true);
        });
        it('returns false if shipping is not required', function () {
            var cart = carts_mock_1.getCart();
            var selector = new Selector(tslib_1.__assign({}, cart, { shipping: tslib_1.__assign({}, cart.shipping, { required: false }) }));
            expect(selector.isShippingRequired()).toEqual(false);
        });
    });
});
//# sourceMappingURL=order-summary-selector-mixin.spec.js.map