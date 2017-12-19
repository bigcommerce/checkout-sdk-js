"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var countries_mock_1 = require("../geography/countries.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var shipping_country_reducer_1 = require("./shipping-country-reducer");
var actionTypes = require("./shipping-country-action-types");
describe('shippingCountryReducer()', function () {
    var initialState;
    beforeEach(function () {
        initialState = {
            data: countries_mock_1.getCountries(),
        };
    });
    it('returns a new state when fetching new countries', function () {
        var action = {
            type: actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED,
        };
        expect(shipping_country_reducer_1.default(initialState, action)).toEqual(tslib_1.__assign({}, initialState, { errors: {}, statuses: { isLoading: true } }));
    });
    it('returns a new state when countries are fetched', function () {
        var action = {
            type: actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED,
            payload: [
                { code: 'JP', name: 'Japan' },
            ],
        };
        expect(shipping_country_reducer_1.default(initialState, action)).toEqual({
            data: action.payload,
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });
    it('returns a new state when countries cannot be fetched', function () {
        var action = {
            type: actionTypes.LOAD_SHIPPING_COUNTRIES_FAILED,
            payload: errors_mock_1.getErrorResponseBody(),
        };
        expect(shipping_country_reducer_1.default(initialState, action)).toEqual(tslib_1.__assign({}, initialState, { errors: { loadError: action.payload }, statuses: { isLoading: false } }));
    });
});
//# sourceMappingURL=shipping-country-reducer.spec.js.map