"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("@bigcommerce/data-store");
var actionTypes = require("./coupon-action-types");
var CouponActionCreator = (function () {
    function CouponActionCreator(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }
    CouponActionCreator.prototype.applyCoupon = function (code, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.APPLY_COUPON_REQUESTED));
            _this._checkoutClient.applyCoupon(code, options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.APPLY_COUPON_SUCCEEDED, data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.APPLY_COUPON_FAILED, response));
            });
        });
    };
    CouponActionCreator.prototype.removeCoupon = function (code, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.REMOVE_COUPON_REQUESTED));
            _this._checkoutClient.removeCoupon(code, options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                observer.next(data_store_1.createAction(actionTypes.REMOVE_COUPON_SUCCEEDED, data));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.REMOVE_COUPON_FAILED, response));
            });
        });
    };
    return CouponActionCreator;
}());
exports.default = CouponActionCreator;
//# sourceMappingURL=coupon-action-creator.js.map