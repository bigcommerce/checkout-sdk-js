"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var countries_mock_1 = require("../geography/countries.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var actionTypes = require("./shipping-country-action-types");
var shipping_country_action_creator_1 = require("./shipping-country-action-creator");
describe('ShippingCountryActionCreator', function () {
    var checkoutClient;
    var shippingCountryActionCreator;
    var errorResponse;
    var response;
    beforeEach(function () {
        response = responses_mock_1.getResponse({ data: countries_mock_1.getCountries() });
        errorResponse = responses_mock_1.getErrorResponse(errors_mock_1.getErrorResponseBody());
        checkoutClient = {
            loadShippingCountries: jest.fn(function () { return Promise.resolve(response); }),
        };
        shippingCountryActionCreator = new shipping_country_action_creator_1.default(checkoutClient);
    });
    describe('#loadCountries()', function () {
        it('emits actions if able to load countries', function () {
            shippingCountryActionCreator.loadCountries()
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED },
                    { type: actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable to load countries', function () {
            checkoutClient.loadShippingCountries.mockImplementation(function () { return Promise.reject(errorResponse); });
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            shippingCountryActionCreator.loadCountries()
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(errorHandler).toHaveBeenCalled();
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED },
                    { type: actionTypes.LOAD_SHIPPING_COUNTRIES_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
    });
});
//# sourceMappingURL=shipping-country-action-creator.spec.js.map