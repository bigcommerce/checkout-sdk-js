"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = require("@bigcommerce/data-store");
var Observable_1 = require("rxjs/Observable");
var actionTypes = require("./country-action-types");
var CountryActionCreator = (function () {
    function CountryActionCreator(_checkoutClient) {
        this._checkoutClient = _checkoutClient;
    }
    CountryActionCreator.prototype.loadCountries = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_COUNTRIES_REQUESTED));
            _this._checkoutClient.loadCountries(options)
                .then(function (_a) {
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                observer.next(data_store_1.createAction(actionTypes.LOAD_COUNTRIES_SUCCEEDED, body.data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_COUNTRIES_FAILED, response));
            });
        });
    };
    return CountryActionCreator;
}());
exports.default = CountryActionCreator;
//# sourceMappingURL=country-action-creator.js.map