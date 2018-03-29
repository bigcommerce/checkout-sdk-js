"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = require("@bigcommerce/data-store");
var Observable_1 = require("rxjs/Observable");
var errors_1 = require("../cart/errors");
var checkout_actions_1 = require("./checkout-actions");
var CheckoutActionCreator = (function () {
    function CheckoutActionCreator(_checkoutRequestSender, _cartRequestSender) {
        this._checkoutRequestSender = _checkoutRequestSender;
        this._cartRequestSender = _cartRequestSender;
    }
    CheckoutActionCreator.prototype.loadCheckout = function (options) {
        var _this = this;
        return Observable_1.Observable.create(function (observer) {
            observer.next(data_store_1.createAction(checkout_actions_1.CheckoutActionType.LoadCheckoutRequested));
            _this._cartRequestSender.loadCarts(options)
                .then(function (_a) {
                var cart = _a.body[0];
                if (!cart) {
                    throw new errors_1.CartUnavailableError();
                }
                return cart.id;
            })
                .then(function (id) { return _this._checkoutRequestSender.loadCheckout(id, options); })
                .then(function (_a) {
                var body = _a.body;
                observer.next(data_store_1.createAction(checkout_actions_1.CheckoutActionType.LoadCheckoutSucceeded, body));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(checkout_actions_1.CheckoutActionType.LoadCheckoutFailed, response));
            });
        });
    };
    return CheckoutActionCreator;
}());
exports.default = CheckoutActionCreator;
//# sourceMappingURL=checkout-action-creator.js.map