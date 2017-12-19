"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var payment_strategy_registry_1 = require("./payment-strategy-registry");
var payment_methods_mock_1 = require("./payment-methods.mock");
describe('PaymentStrategyRegistry', function () {
    var registry;
    var CreditCardPaymentStrategy = /** @class */ (function () {
        function CreditCardPaymentStrategy() {
        }
        CreditCardPaymentStrategy.prototype.execute = function () {
            return new Promise(function () { });
        };
        return CreditCardPaymentStrategy;
    }());
    var LegacyPaymentStrategy = /** @class */ (function () {
        function LegacyPaymentStrategy() {
        }
        LegacyPaymentStrategy.prototype.execute = function () {
            return new Promise(function () { });
        };
        return LegacyPaymentStrategy;
    }());
    var OfflinePaymentStrategy = /** @class */ (function () {
        function OfflinePaymentStrategy() {
        }
        OfflinePaymentStrategy.prototype.execute = function () {
            return new Promise(function () { });
        };
        return OfflinePaymentStrategy;
    }());
    var OffsitePaymentStrategy = /** @class */ (function () {
        function OffsitePaymentStrategy() {
        }
        OffsitePaymentStrategy.prototype.execute = function () {
            return new Promise(function () { });
        };
        return OffsitePaymentStrategy;
    }());
    var AuthorizenetPaymentStrategy = /** @class */ (function () {
        function AuthorizenetPaymentStrategy() {
        }
        AuthorizenetPaymentStrategy.prototype.execute = function () {
            return new Promise(function () { });
        };
        return AuthorizenetPaymentStrategy;
    }());
    beforeEach(function () {
        registry = new payment_strategy_registry_1.default({
            clientSidePaymentProviders: [
                'adyen',
                'braintree',
            ],
        });
    });
    describe('#addStrategy()', function () {
        it('adds payment strategy to registry', function () {
            registry.addStrategy('creditcard', new CreditCardPaymentStrategy());
            expect(registry.getStrategy('creditcard')).toBeInstanceOf(CreditCardPaymentStrategy);
        });
        it('throws error if payment strategy is not found', function () {
            expect(function () { return registry.getStrategy('abc'); }).toThrow();
        });
        it('throws error if payment strategy is already registered with same name', function () {
            expect(function () { return registry.addStrategy('creditcard', new CreditCardPaymentStrategy()); }).not.toThrow();
            expect(function () { return registry.addStrategy('creditcard', new CreditCardPaymentStrategy()); }).toThrow();
        });
    });
    describe('#getStrategyByMethod()', function () {
        beforeEach(function () {
            registry.addStrategy('authorizenet', new AuthorizenetPaymentStrategy());
            registry.addStrategy('creditcard', new CreditCardPaymentStrategy());
            registry.addStrategy('legacy', new LegacyPaymentStrategy());
            registry.addStrategy('offline', new OfflinePaymentStrategy());
            registry.addStrategy('offsite', new OffsitePaymentStrategy());
        });
        it('returns strategy if registered with method name', function () {
            expect(registry.getStrategyByMethod(payment_methods_mock_1.getAuthorizenet())).toBeInstanceOf(AuthorizenetPaymentStrategy);
        });
        it('returns credit card strategy if none is registered with method name', function () {
            expect(registry.getStrategyByMethod(payment_methods_mock_1.getBraintree())).toBeInstanceOf(CreditCardPaymentStrategy);
        });
        it('returns offsite strategy if none is registered with method name and method is hosted', function () {
            expect(registry.getStrategyByMethod(payment_methods_mock_1.getAdyenAmex())).toBeInstanceOf(OffsitePaymentStrategy);
        });
        it('returns offline strategy if none is registered with method name and method is offline', function () {
            expect(registry.getStrategyByMethod(payment_methods_mock_1.getBankDeposit())).toBeInstanceOf(OfflinePaymentStrategy);
        });
        it('returns legacy strategy if none is registered with method name and client-side payment is not supported by method', function () {
            expect(registry.getStrategyByMethod(payment_methods_mock_1.getCybersource())).toBeInstanceOf(LegacyPaymentStrategy);
        });
    });
});
//# sourceMappingURL=payment-strategy-registry.spec.js.map