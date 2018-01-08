"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("../../data-store");
var actionTypes = require("./shipping-address-action-types");
var ShippingAddressActionCreator = (function () {
    function ShippingAddressActionCreator(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }
    ShippingAddressActionCreator.prototype.updateAddress = function (address, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.UPDATE_SHIPPING_ADDRESS_REQUESTED));
            _this._checkoutClient.updateShippingAddress(address, options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.UPDATE_SHIPPING_ADDRESS_SUCCEEDED, data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.UPDATE_SHIPPING_ADDRESS_FAILED, response));
            });
        });
    };
    return ShippingAddressActionCreator;
}());
exports.default = ShippingAddressActionCreator;
//# sourceMappingURL=shipping-address-action-creator.js.map