"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var quotes_mock_1 = require("./quotes.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var actionTypes = require("./quote-action-types");
var quote_action_creator_1 = require("./quote-action-creator");
describe('QuoteActionCreator', function () {
    var checkoutClient;
    var quoteActionCreator;
    var errorResponse;
    var response;
    beforeEach(function () {
        response = responses_mock_1.getResponse(quotes_mock_1.getQuoteResponseBody());
        errorResponse = responses_mock_1.getErrorResponse(errors_mock_1.getErrorResponseBody());
        checkoutClient = {
            loadCheckout: jest.fn(function () { return Promise.resolve(response); }),
        };
        quoteActionCreator = new quote_action_creator_1.default(checkoutClient);
    });
    describe('#loadQuote()', function () {
        it('emits actions if able to load quote', function () {
            quoteActionCreator.loadQuote()
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_QUOTE_REQUESTED },
                    { type: actionTypes.LOAD_QUOTE_SUCCEEDED, meta: response.body.meta, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable to load quote', function () {
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            checkoutClient.loadCheckout.mockReturnValue(Promise.reject(errorResponse));
            quoteActionCreator.loadQuote()
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_QUOTE_REQUESTED },
                    { type: actionTypes.LOAD_QUOTE_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
    });
});
//# sourceMappingURL=quote-action-creator.spec.js.map