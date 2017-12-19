"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var quotes_mock_1 = require("./quotes.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var quote_selector_1 = require("./quote-selector");
describe('QuoteSelector', function () {
    var quote;
    var quoteMeta;
    var quoteSelector;
    var state;
    beforeEach(function () {
        quote = quotes_mock_1.getQuote();
        quoteMeta = quotes_mock_1.getQuoteMeta();
        state = {
            quote: {
                data: quote,
                meta: quoteMeta,
            },
        };
    });
    describe('#getQuote()', function () {
        it('returns the current quote', function () {
            quoteSelector = new quote_selector_1.default(state.quote);
            expect(quoteSelector.getQuote()).toEqual(quote);
        });
    });
    describe('#getQuoteMeta()', function () {
        it('returns quote metadata', function () {
            quoteSelector = new quote_selector_1.default(state.quote);
            expect(quoteSelector.getQuoteMeta()).toEqual(quoteMeta);
        });
    });
    describe('#getLoadError()', function () {
        it('returns error if unable to load', function () {
            var loadError = errors_mock_1.getErrorResponseBody();
            quoteSelector = new quote_selector_1.default(tslib_1.__assign({}, state.quote, { errors: { loadError: loadError } }));
            expect(quoteSelector.getLoadError()).toEqual(loadError);
        });
        it('does not returns error if able to load', function () {
            quoteSelector = new quote_selector_1.default(state.quote);
            expect(quoteSelector.getLoadError()).toBeUndefined();
        });
    });
    describe('#isLoading()', function () {
        it('returns true if loading quote', function () {
            quoteSelector = new quote_selector_1.default(tslib_1.__assign({}, state.quote, { statuses: { isLoading: true } }));
            expect(quoteSelector.isLoading()).toEqual(true);
        });
        it('returns false if not loading quote', function () {
            quoteSelector = new quote_selector_1.default(state.quote);
            expect(quoteSelector.isLoading()).toEqual(false);
        });
    });
});
//# sourceMappingURL=quote-selector.spec.js.map