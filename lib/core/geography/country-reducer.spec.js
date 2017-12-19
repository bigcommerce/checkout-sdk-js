"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var countries_mock_1 = require("./countries.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var country_reducer_1 = require("./country-reducer");
var actionTypes = require("./country-action-types");
describe('countryReducer()', function () {
    var initialState;
    beforeEach(function () {
        initialState = {
            data: countries_mock_1.getCountries(),
        };
    });
    it('returns a new state when fetching new countries', function () {
        var action = {
            type: actionTypes.LOAD_COUNTRIES_REQUESTED,
        };
        expect(country_reducer_1.default(initialState, action)).toEqual(tslib_1.__assign({}, initialState, { errors: {}, statuses: { isLoading: true } }));
    });
    it('returns a new state when countries are fetched', function () {
        var action = {
            type: actionTypes.LOAD_COUNTRIES_SUCCEEDED,
            payload: [
                { code: 'JP', name: 'Japan' },
            ],
        };
        expect(country_reducer_1.default(initialState, action)).toEqual({
            data: action.payload,
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });
    it('returns a new state when countries cannot be fetched', function () {
        var action = {
            type: actionTypes.LOAD_COUNTRIES_FAILED,
            payload: errors_mock_1.getErrorResponseBody(),
        };
        expect(country_reducer_1.default(initialState, action)).toEqual(tslib_1.__assign({}, initialState, { errors: { loadError: action.payload }, statuses: { isLoading: false } }));
    });
});
//# sourceMappingURL=country-reducer.spec.js.map