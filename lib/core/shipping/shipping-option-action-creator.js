"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("../../data-store");
var actionTypes = require("./shipping-option-action-types.js");
var ShippingOptionActionCreator = (function () {
    function ShippingOptionActionCreator(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }
    ShippingOptionActionCreator.prototype.loadShippingOptions = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_SHIPPING_OPTIONS_REQUESTED));
            _this._checkoutClient.loadShippingOptions(options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.LOAD_SHIPPING_OPTIONS_SUCCEEDED, data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_SHIPPING_OPTIONS_FAILED, response));
            });
        });
    };
    ShippingOptionActionCreator.prototype.selectShippingOption = function (addressId, shippingOptionId, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.SELECT_SHIPPING_OPTION_REQUESTED));
            _this._checkoutClient.selectShippingOption(addressId, shippingOptionId, options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.SELECT_SHIPPING_OPTION_SUCCEEDED, data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.SELECT_SHIPPING_OPTION_FAILED, response));
            });
        });
    };
    return ShippingOptionActionCreator;
}());
exports.default = ShippingOptionActionCreator;
//# sourceMappingURL=shipping-option-action-creator.js.map