"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = require("@bigcommerce/data-store");
var Observable_1 = require("rxjs/Observable");
var actionTypes = require("./config-action-types");
var ConfigActionCreator = (function () {
    function ConfigActionCreator(_checkoutClient) {
        this._checkoutClient = _checkoutClient;
    }
    ConfigActionCreator.prototype.loadConfig = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_CONFIG_REQUESTED));
            _this._checkoutClient.loadConfig(options)
                .then(function (_a) {
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                observer.next(data_store_1.createAction(actionTypes.LOAD_CONFIG_SUCCEEDED, body.data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_CONFIG_FAILED, response));
            });
        });
    };
    return ConfigActionCreator;
}());
exports.default = ConfigActionCreator;
//# sourceMappingURL=config-action-creator.js.map