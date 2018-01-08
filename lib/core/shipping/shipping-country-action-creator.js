"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("../../data-store");
var actionTypes = require("./shipping-country-action-types");
var ShippingCountryActionCreator = (function () {
    function ShippingCountryActionCreator(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }
    ShippingCountryActionCreator.prototype.loadCountries = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_SHIPPING_COUNTRIES_REQUESTED));
            _this._checkoutClient.loadShippingCountries(options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.LOAD_SHIPPING_COUNTRIES_SUCCEEDED, data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_SHIPPING_COUNTRIES_FAILED, response));
            });
        });
    };
    return ShippingCountryActionCreator;
}());
exports.default = ShippingCountryActionCreator;
//# sourceMappingURL=shipping-country-action-creator.js.map