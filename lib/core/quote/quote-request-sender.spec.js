"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var http_request_1 = require("../../http-request");
var quotes_mock_1 = require("./quotes.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var quote_request_sender_1 = require("./quote-request-sender");
describe('QuoteRequestSender', function () {
    var quoteRequestSender;
    var response;
    var requestSender;
    beforeEach(function () {
        response = responses_mock_1.getResponse(quotes_mock_1.getQuoteResponseBody());
        requestSender = {
            get: jest.fn(function () { return Promise.resolve(response); }),
        };
        quoteRequestSender = new quote_request_sender_1.default(requestSender);
    });
    describe('#loadQuote()', function () {
        it('sends request to load quote', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, quoteRequestSender.loadQuote()];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/quote', {
                            params: {
                                includes: 'cart,customer,shippingOptions,order',
                            },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('sends request to load quote with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, quoteRequestSender.loadQuote(options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/checkout/quote', tslib_1.__assign({}, options, { params: {
                                includes: 'cart,customer,shippingOptions,order',
                            } }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=quote-request-sender.spec.js.map