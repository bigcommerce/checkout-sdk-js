"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_mock_1 = require("../common/error/errors.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
var shipping_address_selector_1 = require("./shipping-address-selector");
describe('ShippingAddressSelector', function () {
    var shippingAddressSelector;
    var state;
    beforeEach(function () {
        state = {
            quote: quotes_mock_1.getQuoteState(),
        };
    });
    describe('#getShippingAddress()', function () {
        it('returns the current shipping address', function () {
            shippingAddressSelector = new shipping_address_selector_1.default(state.quote);
            expect(shippingAddressSelector.getShippingAddress()).toEqual(state.quote.data.shippingAddress);
        });
    });
    describe('#getUpdateError()', function () {
        it('returns error if unable to update', function () {
            var updateShippingAddressError = errors_mock_1.getErrorResponseBody();
            shippingAddressSelector = new shipping_address_selector_1.default(tslib_1.__assign({}, state.quote, { errors: { updateShippingAddressError: updateShippingAddressError } }));
            expect(shippingAddressSelector.getUpdateError()).toEqual(updateShippingAddressError);
        });
        it('does not returns error if able to update', function () {
            shippingAddressSelector = new shipping_address_selector_1.default(state.quote);
            expect(shippingAddressSelector.getUpdateError()).toBeUndefined();
        });
    });
    describe('#isUpdating()', function () {
        it('returns true if updating shipping address', function () {
            shippingAddressSelector = new shipping_address_selector_1.default(tslib_1.__assign({}, state.quote, { statuses: { isUpdatingShippingAddress: true } }));
            expect(shippingAddressSelector.isUpdating()).toEqual(true);
        });
        it('returns false if not updating shipping address', function () {
            shippingAddressSelector = new shipping_address_selector_1.default(state.quote);
            expect(shippingAddressSelector.isUpdating()).toEqual(false);
        });
    });
});
//# sourceMappingURL=shipping-address-selector.spec.js.map