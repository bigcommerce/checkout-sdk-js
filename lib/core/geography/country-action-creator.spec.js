"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var countries_mock_1 = require("./countries.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var responses_mock_1 = require("../../http-request/responses.mock");
var actionTypes = require("./country-action-types");
var country_action_creator_1 = require("./country-action-creator");
describe('CountryActionCreator', function () {
    var checkoutClient;
    var countryActionCreator;
    var errorResponse;
    var response;
    beforeEach(function () {
        response = responses_mock_1.getResponse({ data: countries_mock_1.getCountries() });
        errorResponse = responses_mock_1.getErrorResponse(errors_mock_1.getErrorResponseBody());
        checkoutClient = {
            loadCountries: jest.fn(function () { return Promise.resolve(response); }),
        };
        countryActionCreator = new country_action_creator_1.default(checkoutClient);
    });
    describe('#loadCountries()', function () {
        it('emits actions if able to load countries', function () {
            countryActionCreator.loadCountries()
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_COUNTRIES_REQUESTED },
                    { type: actionTypes.LOAD_COUNTRIES_SUCCEEDED, payload: response.body.data },
                ]);
            });
        });
        it('emits error actions if unable to load countries', function () {
            checkoutClient.loadCountries.mockReturnValue(Promise.reject(errorResponse));
            var errorHandler = jest.fn(function (action) { return rxjs_1.Observable.of(action); });
            countryActionCreator.loadCountries()
                .catch(errorHandler)
                .toArray()
                .subscribe(function (actions) {
                expect(actions).toEqual([
                    { type: actionTypes.LOAD_COUNTRIES_REQUESTED },
                    { type: actionTypes.LOAD_COUNTRIES_FAILED, payload: errorResponse, error: true },
                ]);
            });
        });
    });
});
//# sourceMappingURL=country-action-creator.spec.js.map