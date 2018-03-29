"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var data_store_1 = require("@bigcommerce/data-store");
var Observable_1 = require("rxjs/Observable");
var customer_strategy_actions_1 = require("./customer-strategy-actions");
var CustomerStrategyActionCreator = (function () {
    function CustomerStrategyActionCreator(_strategyRegistry) {
        this._strategyRegistry = _strategyRegistry;
    }
    CustomerStrategyActionCreator.prototype.signIn = function (credentials, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return Observable_1.Observable.create(function (observer) {
            var meta = { methodId: options.methodId };
            observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.SignInRequested, undefined, meta));
            _this._strategyRegistry.get(options.methodId)
                .signIn(credentials, options)
                .then(function () {
                observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.SignInSucceeded, undefined, meta));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(customer_strategy_actions_1.CustomerStrategyActionType.SignInFailed, error, meta));
            });
        });
    };
    CustomerStrategyActionCreator.prototype.signOut = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return Observable_1.Observable.create(function (observer) {
            var meta = { methodId: options.methodId };
            observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.SignOutRequested, undefined, meta));
            _this._strategyRegistry.get(options.methodId)
                .signOut(options)
                .then(function () {
                observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.SignOutSucceeded, undefined, meta));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(customer_strategy_actions_1.CustomerStrategyActionType.SignOutFailed, error, meta));
            });
        });
    };
    CustomerStrategyActionCreator.prototype.initialize = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return Observable_1.Observable.create(function (observer) {
            var meta = { methodId: options.methodId };
            observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.InitializeRequested, undefined, meta));
            _this._strategyRegistry.get(options.methodId)
                .initialize(options)
                .then(function () {
                observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.InitializeSucceeded, undefined, meta));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(customer_strategy_actions_1.CustomerStrategyActionType.InitializeFailed, error, meta));
            });
        });
    };
    CustomerStrategyActionCreator.prototype.deinitialize = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return Observable_1.Observable.create(function (observer) {
            var meta = { methodId: options.methodId };
            observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeRequested, undefined, meta));
            _this._strategyRegistry.get(options.methodId)
                .deinitialize(options)
                .then(function () {
                observer.next(data_store_1.createAction(customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeSucceeded, undefined, meta));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(customer_strategy_actions_1.CustomerStrategyActionType.DeinitializeFailed, error, meta));
            });
        });
    };
    return CustomerStrategyActionCreator;
}());
exports.default = CustomerStrategyActionCreator;
//# sourceMappingURL=customer-strategy-action-creator.js.map