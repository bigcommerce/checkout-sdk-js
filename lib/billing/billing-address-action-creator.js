"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = require("@bigcommerce/data-store");
var Observable_1 = require("rxjs/Observable");
var actionTypes = require("./billing-address-action-types");
var BillingAddressActionCreator = (function () {
    function BillingAddressActionCreator(_checkoutClient) {
        this._checkoutClient = _checkoutClient;
    }
    BillingAddressActionCreator.prototype.updateAddress = function (address, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.UPDATE_BILLING_ADDRESS_REQUESTED));
            _this._checkoutClient.updateBillingAddress(address, options)
                .then(function (_a) {
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                observer.next(data_store_1.createAction(actionTypes.UPDATE_BILLING_ADDRESS_SUCCEEDED, body.data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.UPDATE_BILLING_ADDRESS_FAILED, response));
            });
        });
    };
    return BillingAddressActionCreator;
}());
exports.default = BillingAddressActionCreator;
//# sourceMappingURL=billing-address-action-creator.js.map