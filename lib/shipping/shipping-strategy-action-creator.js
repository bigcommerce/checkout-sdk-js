"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var Observable_1 = require("rxjs/Observable");
var shipping_strategy_actions_1 = require("./shipping-strategy-actions");
var ShippingStrategyActionCreator = (function () {
    function ShippingStrategyActionCreator(_strategyRegistry) {
        this._strategyRegistry = _strategyRegistry;
    }
    ShippingStrategyActionCreator.prototype.updateAddress = function (address, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var _a = (store.getState().checkout.getCustomer() || {}).remote, remote = _a === void 0 ? {} : _a;
            var methodId = options.methodId || remote.provider;
            observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressRequested, undefined, { methodId: methodId }));
            _this._strategyRegistry.get(methodId)
                .updateAddress(address, tslib_1.__assign({}, options, { methodId: methodId }))
                .then(function () {
                observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressSucceeded, undefined, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(shipping_strategy_actions_1.ShippingStrategyActionType.UpdateAddressFailed, error, { methodId: methodId }));
            });
        }); };
    };
    ShippingStrategyActionCreator.prototype.selectOption = function (addressId, shippingOptionId, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var _a = (store.getState().checkout.getCustomer() || {}).remote, remote = _a === void 0 ? {} : _a;
            var methodId = options.methodId || remote.provider;
            observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionRequested, undefined, { methodId: methodId }));
            _this._strategyRegistry.get(methodId)
                .selectOption(addressId, shippingOptionId, tslib_1.__assign({}, options, { methodId: methodId }))
                .then(function () {
                observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionSucceeded, undefined, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(shipping_strategy_actions_1.ShippingStrategyActionType.SelectOptionFailed, error, { methodId: methodId }));
            });
        }); };
    };
    ShippingStrategyActionCreator.prototype.initialize = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var _a = (store.getState().checkout.getCustomer() || {}).remote, remote = _a === void 0 ? {} : _a;
            var methodId = options.methodId || remote.provider;
            observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.InitializeRequested, undefined, { methodId: methodId }));
            _this._strategyRegistry.get(methodId)
                .initialize(tslib_1.__assign({}, options, { methodId: methodId }))
                .then(function () {
                observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.InitializeSucceeded, undefined, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(shipping_strategy_actions_1.ShippingStrategyActionType.InitializeFailed, error, { methodId: methodId }));
            });
        }); };
    };
    ShippingStrategyActionCreator.prototype.deinitialize = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var _a = (store.getState().checkout.getCustomer() || {}).remote, remote = _a === void 0 ? {} : _a;
            var methodId = options.methodId || remote.provider;
            observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeRequested, undefined, { methodId: methodId }));
            _this._strategyRegistry.get(methodId)
                .deinitialize(tslib_1.__assign({}, options, { methodId: methodId }))
                .then(function () {
                observer.next(data_store_1.createAction(shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeSucceeded, undefined, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(shipping_strategy_actions_1.ShippingStrategyActionType.DeinitializeFailed, error, { methodId: methodId }));
            });
        }); };
    };
    return ShippingStrategyActionCreator;
}());
exports.default = ShippingStrategyActionCreator;
//# sourceMappingURL=shipping-strategy-action-creator.js.map