"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = require("@bigcommerce/data-store");
var Observable_1 = require("rxjs/Observable");
var actionTypes = require("./cart-action-types");
var cart_comparator_1 = require("./cart-comparator");
var CartActionCreator = (function () {
    function CartActionCreator(_checkoutClient) {
        this._checkoutClient = _checkoutClient;
    }
    CartActionCreator.prototype.loadCart = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.LOAD_CART_REQUESTED));
            _this._checkoutClient.loadCart(options)
                .then(function (_a) {
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                observer.next(data_store_1.createAction(actionTypes.LOAD_CART_SUCCEEDED, body.data, body.meta));
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
                var _b = _a.body, body = _b === void 0 ? {} : _b;
                var comparator = new cart_comparator_1.default();
                var isValid = cart ? comparator.isEqual(cart, body.data.cart) : false;
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