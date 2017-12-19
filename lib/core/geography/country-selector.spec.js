"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var countries_mock_1 = require("./countries.mock");
var errors_mock_1 = require("../common/error/errors.mock");
var country_selector_1 = require("./country-selector");
describe('CountrySelector', function () {
    var countrySelector;
    var state;
    beforeEach(function () {
        state = {
            countries: {
                meta: {},
                data: countries_mock_1.getCountries(),
            },
        };
    });
    describe('#getCountries()', function () {
        it('returns a list of countries', function () {
            countrySelector = new country_selector_1.default(state.countries);
            expect(countrySelector.getCountries()).toEqual(state.countries.data);
        });
        it('returns an empty array if there are no countries', function () {
            countrySelector = new country_selector_1.default(tslib_1.__assign({}, state.countries, { data: [] }));
            expect(countrySelector.getCountries()).toEqual([]);
        });
    });
    describe('#getLoadError()', function () {
        it('returns error if unable to load', function () {
            var loadError = errors_mock_1.getErrorResponseBody();
            countrySelector = new country_selector_1.default(tslib_1.__assign({}, state.countries, { errors: { loadError: loadError } }));
            expect(countrySelector.getLoadError()).toEqual(loadError);
        });
        it('does not returns error if able to load', function () {
            countrySelector = new country_selector_1.default(state.countries);
            expect(countrySelector.getLoadError()).toBeUndefined();
        });
    });
    describe('#isLoading()', function () {
        it('returns true if loading countries', function () {
            countrySelector = new country_selector_1.default(tslib_1.__assign({}, state.countries, { statuses: { isLoading: true } }));
            expect(countrySelector.isLoading()).toEqual(true);
        });
        it('returns false if not loading countries', function () {
            countrySelector = new country_selector_1.default(state.countries);
            expect(countrySelector.isLoading()).toEqual(false);
        });
    });
});
//# sourceMappingURL=country-selector.spec.js.map