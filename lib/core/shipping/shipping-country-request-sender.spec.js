"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var http_request_1 = require("../../http-request");
var shipping_countries_mock_1 = require("./shipping-countries.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var shipping_country_request_sender_1 = require("./shipping-country-request-sender");
describe('ShippingCountryRequestSender', function () {
    var shippingCountryRequestSender;
    var requestSender;
    beforeEach(function () {
        requestSender = {
            get: jest.fn(function () { return Promise.resolve(); }),
        };
        shippingCountryRequestSender = new shipping_country_request_sender_1.default(requestSender, { locale: 'en' });
    });
    describe('#loadCountries()', function () {
        var response;
        beforeEach(function () {
            response = responses_mock_1.getResponse(shipping_countries_mock_1.getShippingCountriesResponseBody());
            requestSender.get.mockReturnValue(Promise.resolve(response));
        });
        it('loads shipping countries', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, shippingCountryRequestSender.loadCountries()];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/shipping/countries', {
                            headers: {
                                'Accept-Language': 'en',
                            },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads shipping countries with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, shippingCountryRequestSender.loadCountries(options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/shipping/countries', tslib_1.__assign({}, options, { headers: {
                                'Accept-Language': 'en',
                            } }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=shipping-country-request-sender.spec.js.map