"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("../../data-store");
var actionTypes = require("./config-action-types");
var ConfigActionCreator = (function () {
    function ConfigActionCreator(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }
    ConfigActionCreator.prototype.loadConfig = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_CONFIG_REQUESTED));
            _this._checkoutClient.loadConfig(options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.LOAD_CONFIG_SUCCEEDED, data));
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