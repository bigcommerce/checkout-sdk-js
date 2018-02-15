"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FormSelector = (function () {
    function FormSelector(config) {
        if (config === void 0) { config = {}; }
        this._config = config.data;
    }
    FormSelector.prototype.getShippingAddressFields = function () {
        return this._config.storeConfig.formFields.shippingAddressFields;
    };
    FormSelector.prototype.getBillingAddressFields = function () {
        return this._config.storeConfig.formFields.billingAddressFields;
    };
    return FormSelector;
}());
exports.default = FormSelector;
//# sourceMappingURL=form-selector.js.map