"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = require("lodash");
var FormSelector = (function () {
    function FormSelector(config) {
        if (config === void 0) { config = {}; }
        this._config = config.data;
    }
    FormSelector.prototype.getShippingAddressFields = function (countries, countryCode) {
        var _this = this;
        if (countries === void 0) { countries = []; }
        var selectedCountry = lodash_1.find(countries, { code: countryCode });
        return this._config.storeConfig.formFields.shippingAddressFields
            .map(function (field) { return _this._processField(field, countries, selectedCountry); });
    };
    FormSelector.prototype.getBillingAddressFields = function (countries, countryCode) {
        var _this = this;
        if (countries === void 0) { countries = []; }
        var selectedCountry = lodash_1.find(countries, { code: countryCode });
        return this._config.storeConfig.formFields.billingAddressFields
            .map(function (field) { return _this._processField(field, countries, selectedCountry); });
    };
    FormSelector.prototype._processField = function (field, countries, selectedCountry) {
        if (selectedCountry === void 0) { selectedCountry = {}; }
        if (field.name === 'countryCode') {
            return this._processCountry(field, countries, selectedCountry);
        }
        if (field.name === 'province') {
            return this._processProvince(field, selectedCountry);
        }
        if (field.name === 'postCode') {
            return this._processsPostCode(field, selectedCountry);
        }
        return field;
    };
    FormSelector.prototype._processCountry = function (field, countries, _a) {
        if (countries === void 0) { countries = []; }
        var _b = _a.code, code = _b === void 0 ? '' : _b;
        if (!countries.length) {
            return field;
        }
        var items = countries.map(function (_a) {
            var code = _a.code, name = _a.name;
            return ({
                value: code,
                label: name,
            });
        });
        return tslib_1.__assign({}, field, { options: { items: items }, default: code, type: 'array', fieldType: 'dropdown', itemtype: 'string' });
    };
    FormSelector.prototype._processProvince = function (field, _a) {
        var _b = _a.subdivisions, subdivisions = _b === void 0 ? [] : _b;
        if (!subdivisions.length) {
            return tslib_1.__assign({}, field, { required: false });
        }
        var items = subdivisions.map(function (_a) {
            var code = _a.code, name = _a.name;
            return ({
                value: code,
                label: name,
            });
        });
        return tslib_1.__assign({}, field, { name: 'provinceCode', options: { items: items }, required: true, type: 'array', fieldType: 'dropdown', itemtype: 'string' });
    };
    FormSelector.prototype._processsPostCode = function (field, _a) {
        var hasPostalCodes = _a.hasPostalCodes;
        if (hasPostalCodes === undefined) {
            return field;
        }
        return tslib_1.__assign({}, field, { required: Boolean(hasPostalCodes) });
    };
    return FormSelector;
}());
exports.default = FormSelector;
//# sourceMappingURL=form-selector.js.map