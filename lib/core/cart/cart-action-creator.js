"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("../../data-store");
var actionTypes = require("./cart-action-types");
var cart_comparator_1 = require("./cart-comparator");
var CartActionCreator = (function () {
    function CartActionCreator(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }
    CartActionCreator.prototype.loadCart = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_CART_REQUESTED));
            _this._checkoutClient.loadCart(options)
                .then(function (_a) {
                var _b = _a.body, _c = _b === void 0 ? {} : _b, data = _c.data, meta = _c.meta;
                observer.next(data_store_1.createAction(actionTypes.LOAD_CART_SUCCEEDED, data, meta));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.LOAD_CART_FAILED, response));
            });
        });
    };
    CartActionCreator.prototype.verifyCart = function (cart, options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.VERIFY_CART_REQUESTED));
            _this._checkoutClient.loadCart(options)
                .then(function (_a) {
                var _b = _a.body, data = (_b === void 0 ? {} : _b).data;
                var comparator = new cart_comparator_1.default();
                var isValid = comparator.isEqual(cart, data.cart);
                observer.next(data_store_1.createAction(actionTypes.VERIFY_CART_SUCCEEDED, isValid));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.VERIFY_CART_FAILED, response));
            });
        });
    };
    return CartActionCreator;
}());
exports.default = CartActionCreator;
//# sourceMappingURL=cart-action-creator.js.map