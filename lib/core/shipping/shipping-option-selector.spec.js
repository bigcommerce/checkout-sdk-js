"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var errors_mock_1 = require("../common/error/errors.mock");
var shipping_options_mock_1 = require("./shipping-options.mock");
var quotes_mock_1 = require("../quote/quotes.mock");
var shipping_option_selector_1 = require("./shipping-option-selector");
describe('ShippingOptionSelector', function () {
    var shippingOptionSelector;
    var state;
    beforeEach(function () {
        state = {
            shippingOptions: shipping_options_mock_1.getShippingOptionsState(),
            quote: quotes_mock_1.getQuoteState(),
        };
    });
    describe('#getShippingOptions()', function () {
        it('returns the current shipping options', function () {
            shippingOptionSelector = new shipping_option_selector_1.default(state.shippingOptions, state.quote);
            expect(shippingOptionSelector.getShippingOptions()).toEqual(state.shippingOptions.data);
        });
    });
    describe('#getSelectedShippingOption()', function () {
        it('returns selected shipping option', function () {
            shippingOptionSelector = new shipping_option_selector_1.default(state.shippingOptions, state.quote);
            expect(shippingOptionSelector.getSelectedShippingOption()).toEqual(shipping_options_mock_1.getFlatRateOption());
        });
        it('returns undefined if shipping option is not selected', function () {
            shippingOptionSelector = new shipping_option_selector_1.default(state.shippingOptions, lodash_1.merge({}, state.quote, {
                data: {
                    shippingOption: '',
                },
            }));
            expect(shippingOptionSelector.getSelectedShippingOption()).toEqual();
        });
    });
    describe('#getLoadError()', function () {
        it('returns error if unable to load', function () {
            var loadError = errors_mock_1.getErrorResponseBody();
            shippingOptionSelector = new shipping_option_selector_1.default(tslib_1.__assign({}, state.shippingOptions, { errors: { loadError: loadError } }), state.quote);
            expect(shippingOptionSelector.getLoadError()).toEqual(loadError);
        });
        it('does not returns error if able to load', function () {
            shippingOptionSelector = new shipping_option_selector_1.default(state.shippingOptions, state.quote);
            expect(shippingOptionSelector.getLoadError()).toBeUndefined();
        });
    });
    describe('#getSelectError()', function () {
        it('returns error if unable to select', function () {
            var selectError = errors_mock_1.getErrorResponseBody();
            shippingOptionSelector = new shipping_option_selector_1.default(tslib_1.__assign({}, state.shippingOptions, { errors: { selectError: selectError } }), state.quote);
            expect(shippingOptionSelector.getSelectError()).toEqual(selectError);
        });
        it('does not returns error if able to select', function () {
            shippingOptionSelector = new shipping_option_selector_1.default(state.shippingOptions, state.quote);
            expect(shippingOptionSelector.getSelectError()).toBeUndefined();
        });
    });
    describe('#isLoading()', function () {
        it('returns true if loading shipping options', function () {
            shippingOptionSelector = new shipping_option_selector_1.default(tslib_1.__assign({}, state.shippingOptions, { statuses: { isLoading: true } }));
            expect(shippingOptionSelector.isLoading()).toEqual(true);
        });
        it('returns false if not loading shipping options', function () {
            shippingOptionSelector = new shipping_option_selector_1.default(state.shippingOptions, state.quote);
            expect(shippingOptionSelector.isLoading()).toEqual(false);
        });
    });
    describe('#isSelecting()', function () {
        it('returns true if selecting shipping options', function () {
            shippingOptionSelector = new shipping_option_selector_1.default(tslib_1.__assign({}, state.shippingOptions, { statuses: { isSelecting: true } }), state.quote);
            expect(shippingOptionSelector.isSelecting()).toEqual(true);
        });
        it('returns false if not selecting shipping options', function () {
            shippingOptionSelector = new shipping_option_selector_1.default(state.shippingOptions, state.quote);
            expect(shippingOptionSelector.isSelecting()).toEqual(false);
        });
    });
});
//# sourceMappingURL=shipping-option-selector.spec.js.map