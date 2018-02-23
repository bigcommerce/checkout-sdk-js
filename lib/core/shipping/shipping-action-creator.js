"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Observable_1 = require("rxjs/Observable");
var data_store_1 = require("../../data-store");
var actionTypes = require("./shipping-action-types");
var ShippingActionCreator = (function () {
    function ShippingActionCreator() {
    }
    ShippingActionCreator.prototype.initializeShipping = function (methodId, initializer) {
        return new Observable_1.Observable(function (observer) {
            observer.next(data_store_1.createAction(actionTypes.INITIALIZE_SHIPPING_REQUESTED, undefined, { methodId: methodId }));
            initializer()
                .then(function (data) {
                observer.next(data_store_1.createAction(actionTypes.INITIALIZE_SHIPPING_SUCCEEDED, data, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (response) {
                observer.error(data_store_1.createErrorAction(actionTypes.INITIALIZE_SHIPPING_FAILED, response, { methodId: methodId }));
            });
        });
    };
    return ShippingActionCreator;
}());
exports.default = ShippingActionCreator;
//# sourceMappingURL=shipping-action-creator.js.map