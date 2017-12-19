"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var errors_mock_1 = require("../common/error/errors.mock");
var shipping_countries_mock_1 = require("./shipping-countries.mock");
var shipping_country_selector_1 = require("./shipping-country-selector");
describe('ShippingCountrySelector', function () {
    var shippingCountrySelector;
    var state;
    beforeEach(function () {
        state = {
            shippingCountries: {
                data: shipping_countries_mock_1.getShippingCountries(),
            },
        };
    });
    describe('#getShippingCountries()', function () {
        it('returns a list of countries', function () {
            shippingCountrySelector = new shipping_country_selector_1.default(state.shippingCountries);
            expect(shippingCountrySelector.getShippingCountries()).toEqual(state.shippingCountries.data);
        });
        it('returns an empty array if there are no countries', function () {
            shippingCountrySelector = new shipping_country_selector_1.default(tslib_1.__assign({}, state.shippingCountries, { data: [] }));
            expect(shippingCountrySelector.getShippingCountries()).toEqual([]);
        });
    });
    describe('#getLoadError()', function () {
        it('returns error if unable to load', function () {
            var loadError = errors_mock_1.getErrorResponseBody();
            shippingCountrySelector = new shipping_country_selector_1.default(tslib_1.__assign({}, state.shippingCountries, { errors: { loadError: loadError } }));
            expect(shippingCountrySelector.getLoadError()).toEqual(loadError);
        });
        it('does not returns error if able to load', function () {
            shippingCountrySelector = new shipping_country_selector_1.default(state.shippingCountries);
            expect(shippingCountrySelector.getLoadError()).toBeUndefined();
        });
    });
    describe('#isLoading()', function () {
        it('returns true if loading countries', function () {
            shippingCountrySelector = new shipping_country_selector_1.default(tslib_1.__assign({}, state.shippingCountries, { statuses: { isLoading: true } }));
            expect(shippingCountrySelector.isLoading()).toEqual(true);
        });
        it('returns false if not loading countries', function () {
            shippingCountrySelector = new shipping_country_selector_1.default(state.shippingCountries);
            expect(shippingCountrySelector.isLoading()).toEqual(false);
        });
    });
});
//# sourceMappingURL=shipping-country-selector.spec.js.map