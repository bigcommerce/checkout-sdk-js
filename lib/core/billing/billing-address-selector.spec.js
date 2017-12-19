"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_mock_1 = require("../common/error/errors.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
var billing_address_selector_1 = require("./billing-address-selector");
describe('BillingAddressSelector', function () {
    var billingAddressSelector;
    var state;
    beforeEach(function () {
        state = {
            quote: quotes_mock_1.getQuoteState(),
        };
    });
    describe('#getBillingAddress()', function () {
        it('returns the current billing address', function () {
            billingAddressSelector = new billing_address_selector_1.default(state.quote);
            expect(billingAddressSelector.getBillingAddress()).toEqual(state.quote.data.billingAddress);
        });
    });
    describe('#getUpdateError()', function () {
        it('returns error if unable to update', function () {
            var updateBillingAddressError = errors_mock_1.getErrorResponseBody();
            billingAddressSelector = new billing_address_selector_1.default(tslib_1.__assign({}, state.quote, { errors: { updateBillingAddressError: updateBillingAddressError } }));
            expect(billingAddressSelector.getUpdateError()).toEqual(updateBillingAddressError);
        });
        it('does not returns error if able to update', function () {
            billingAddressSelector = new billing_address_selector_1.default(state.quote);
            expect(billingAddressSelector.getUpdateError()).toBeUndefined();
        });
    });
    describe('#isUpdating()', function () {
        it('returns true if updating billing address', function () {
            billingAddressSelector = new billing_address_selector_1.default(tslib_1.__assign({}, state.quote, { statuses: { isUpdatingBillingAddress: true } }));
            expect(billingAddressSelector.isUpdating()).toEqual(true);
        });
        it('returns false if not updating billing address', function () {
            billingAddressSelector = new billing_address_selector_1.default(state.quote);
            expect(billingAddressSelector.isUpdating()).toEqual(false);
        });
    });
});
//# sourceMappingURL=billing-address-selector.spec.js.map