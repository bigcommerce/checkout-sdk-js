"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("../../data-store");
var actionTypes = require("./country-action-types");
var CountryActionCreator = /** @class */ (function () {
    /**
     * @constructor
     * @param {CheckoutClient} checkoutClient
     */
    function CountryActionCreator(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }
    /**
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    CountryActionCreator.prototype.loadCountries = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_COUNTRIES_REQUESTED));
            _this._checkoutClient.loadCountries(options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.LOAD_COUNTRIES_SUCCEEDED, data));
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