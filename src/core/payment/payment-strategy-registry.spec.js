import PaymentStrategyRegistry from './payment-strategy-registry';
import { PaymentMethodNotRegistrableError, PaymentMethodUnsupportedError } from './errors';
import { getAdyenAmex, getAuthorizenet, getBankDeposit, getBraintree, getCybersource } from './payment-methods.mock';

describe('PaymentStrategyRegistry', () => {
    let registry;

    class CreditCardPaymentStrategy {
        execute() {
            return new Promise(() => {});
        }
    }

    class LegacyPaymentStrategy {
        execute() {
            return new Promise(() => {});
        }
    }

    class OfflinePaymentStrategy {
        execute() {
            return new Promise(() => {});
        }
    }

    class OffsitePaymentStrategy {
        execute() {
            return new Promise(() => {});
        }
    }

    class AuthorizenetPaymentStrategy {
        execute() {
            return new Promise(() => {});
        }
    }

    beforeEach(() => {
        registry = new PaymentStrategyRegistry({
            clientSidePaymentProviders: [
                'adyen',
                'braintree',
            ],
        });
    });

    describe('#addStrategy()', () => {
        it('adds payment strategy to registry', () => {
            registry.addStrategy('creditcard', new CreditCardPaymentStrategy());

            expect(registry.getStrategy('creditcard')).toBeInstanceOf(CreditCardPaymentStrategy);
        });

        it('throws error if payment strategy is not found', () => {
            expect(() => registry.getStrategy('abc')).toThrow(PaymentMethodUnsupportedError);
        });

        it('throws error if payment strategy is already registered with same name', () => {
            expect(() => registry.addStrategy('creditcard', new CreditCardPaymentStrategy())).not.toThrow();
            expect(() => registry.addStrategy('creditcard', new CreditCardPaymentStrategy())).toThrow(PaymentMethodNotRegistrableError);
        });
    });

    describe('#getStrategyByMethod()', () => {
        beforeEach(() => {
            registry.addStrategy('authorizenet', new AuthorizenetPaymentStrategy());
            registry.addStrategy('creditcard', new CreditCardPaymentStrategy());
            registry.addStrategy('legacy', new LegacyPaymentStrategy());
            registry.addStrategy('offline', new OfflinePaymentStrategy());
            registry.addStrategy('offsite', new OffsitePaymentStrategy());
        });

        it('returns strategy if registered with method name', () => {
            expect(registry.getStrategyByMethod(getAuthorizenet())).toBeInstanceOf(AuthorizenetPaymentStrategy);
        });

        it('returns credit card strategy if none is registered with method name', () => {
            expect(registry.getStrategyByMethod(getBraintree())).toBeInstanceOf(CreditCardPaymentStrategy);
        });

        it('returns offsite strategy if none is registered with method name and method is hosted', () => {
            expect(registry.getStrategyByMethod(getAdyenAmex())).toBeInstanceOf(OffsitePaymentStrategy);
        });

        it('returns offline strategy if none is registered with method name and method is offline', () => {
            expect(registry.getStrategyByMethod(getBankDeposit())).toBeInstanceOf(OfflinePaymentStrategy);
        });

        it('returns legacy strategy if none is registered with method name and client-side payment is not supported by method', () => {
            expect(registry.getStrategyByMethod(getCybersource())).toBeInstanceOf(LegacyPaymentStrategy);
        });
    });
});
