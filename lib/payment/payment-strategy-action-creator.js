"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var data_store_1 = require("@bigcommerce/data-store");
var Observable_1 = require("rxjs/Observable");
var errors_1 = require("../common/error/errors");
var errors_2 = require("../order/errors");
var payment_strategy_actions_1 = require("./payment-strategy-actions");
var PaymentStrategyActionCreator = (function () {
    function PaymentStrategyActionCreator(_strategyRegistry) {
        this._strategyRegistry = _strategyRegistry;
    }
    PaymentStrategyActionCreator.prototype.execute = function (payload, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var checkout = store.getState().checkout;
            var _a = payload.payment, payment = _a === void 0 ? {} : _a, useStoreCredit = payload.useStoreCredit;
            var meta = { methodId: payment.name };
            var strategy;
            if (checkout.isPaymentDataRequired(useStoreCredit)) {
                var method = checkout.getPaymentMethod(payment.name, payment.gateway);
                if (!method) {
                    throw new errors_1.MissingDataError();
                }
                strategy = _this._strategyRegistry.getByMethod(method);
            }
            else {
                strategy = _this._strategyRegistry.get('nopaymentdatarequired');
            }
            observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.ExecuteRequested, undefined, meta));
            strategy
                .execute(payload, options)
                .then(function () {
                observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.ExecuteSucceeded, undefined, meta));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(payment_strategy_actions_1.PaymentStrategyActionType.ExecuteFailed, error, meta));
            });
        }); };
    };
    PaymentStrategyActionCreator.prototype.finalize = function (options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var checkout = store.getState().checkout;
            var order = checkout.getOrder();
            if (!order) {
                throw new errors_1.MissingDataError();
            }
            if (!order.payment || !order.payment.id) {
                throw new errors_2.OrderFinalizationNotRequiredError();
            }
            var method = checkout.getPaymentMethod(order.payment.id, order.payment.gateway);
            var meta = { methodId: method.id };
            observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.FinalizeRequested, undefined, meta));
            _this._strategyRegistry.getByMethod(method)
                .finalize(options)
                .then(function () {
                observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.FinalizeSucceeded, undefined, meta));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(payment_strategy_actions_1.PaymentStrategyActionType.FinalizeFailed, error, meta));
            });
        }); };
    };
    PaymentStrategyActionCreator.prototype.initialize = function (methodId, gatewayId, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var checkout = store.getState().checkout;
            var method = checkout.getPaymentMethod(methodId, gatewayId);
            if (!method) {
                throw new errors_1.MissingDataError();
            }
            observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.InitializeRequested, undefined, { methodId: methodId }));
            _this._strategyRegistry.getByMethod(method)
                .initialize(tslib_1.__assign({}, options, { paymentMethod: method }))
                .then(function () {
                observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.InitializeSucceeded, undefined, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(payment_strategy_actions_1.PaymentStrategyActionType.InitializeFailed, error, { methodId: methodId }));
            });
        }); };
    };
    PaymentStrategyActionCreator.prototype.deinitialize = function (methodId, gatewayId, options) {
        var _this = this;
        return function (store) { return Observable_1.Observable.create(function (observer) {
            var checkout = store.getState().checkout;
            var method = checkout.getPaymentMethod(methodId, gatewayId);
            if (!method) {
                throw new errors_1.MissingDataError();
            }
            observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeRequested, undefined, { methodId: methodId }));
            _this._strategyRegistry.getByMethod(method)
                .deinitialize(options)
                .then(function () {
                observer.next(data_store_1.createAction(payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeSucceeded, undefined, { methodId: methodId }));
                observer.complete();
            })
                .catch(function (error) {
                observer.error(data_store_1.createErrorAction(payment_strategy_actions_1.PaymentStrategyActionType.DeinitializeFailed, error, { methodId: methodId }));
            });
        }); };
    };
    return PaymentStrategyActionCreator;
}());
exports.default = PaymentStrategyActionCreator;
//# sourceMappingURL=payment-strategy-action-creator.js.map