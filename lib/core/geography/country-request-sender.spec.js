"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var http_request_1 = require("../../http-request");
var countries_mock_1 = require("./countries.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var country_request_sender_1 = require("./country-request-sender");
describe('CountryRequestSender', function () {
    var countryRequestSender;
    var requestSender;
    beforeEach(function () {
        requestSender = {
            get: jest.fn(function () { return Promise.resolve(); }),
        };
        countryRequestSender = new country_request_sender_1.default(requestSender, { locale: 'en' });
    });
    describe('#loadCountries()', function () {
        var response;
        beforeEach(function () {
            response = responses_mock_1.getResponse(countries_mock_1.getCountriesResponseBody());
            requestSender.get.mockReturnValue(Promise.resolve(response));
        });
        it('loads countries', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, countryRequestSender.loadCountries()];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/store/countries', {
                            headers: {
                                'Accept-Language': 'en',
                            },
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('loads countries with timeout', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var options, output;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = { timeout: http_request_1.createTimeout() };
                        return [4 /*yield*/, countryRequestSender.loadCountries(options)];
                    case 1:
                        output = _a.sent();
                        expect(output).toEqual(response);
                        expect(requestSender.get).toHaveBeenCalledWith('/internalapi/v1/store/countries', tslib_1.__assign({}, options, { headers: {
                                'Accept-Language': 'en',
                            } }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=country-request-sender.spec.js.map