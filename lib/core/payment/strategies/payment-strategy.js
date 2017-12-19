"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @abstract
 */
var PaymentStrategy = /** @class */ (function () {
    /**
     * @constructor
     * @param {ReadableDataStore} store
     * @param {PlaceOrderService} placeOrderService
     */
    function PaymentStrategy(store, placeOrderService) {
        this._store = store;
        this._placeOrderService = placeOrderService;
    }
    /**
     * @abstract
     * @param {OrderRequestBody} payload
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    PaymentStrategy.prototype.execute = function () {
        throw new Error('Not implemented');
    };
    /**
     * @param {RequestOptions} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    PaymentStrategy.prototype.finalize = function () {
        return Promise.reject(this._store.getState());
    };
    /**
     * @param {Object} [options]
     * @return {Promise<CheckoutSelectors>}
     */
    PaymentStrategy.prototype.initialize = function () {
        return Promise.resolve(this._store.getState());
    };
    /**
     * @return {Promise<CheckoutSelectors>}
     */
    PaymentStrategy.prototype.deinitialize = function () {
        return Promise.resolve(this._store.getState());
    };
    return PaymentStrategy;
}());
exports.default = PaymentStrategy;
//# sourceMappingURL=payment-strategy.js.map