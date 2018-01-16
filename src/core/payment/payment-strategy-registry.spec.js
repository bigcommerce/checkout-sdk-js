import { PaymentMethodNotRegistrableError, PaymentMethodUnsupportedError } from './errors';
import { getAdyenAmex, getAuthorizenet, getBankDeposit, getBraintree, getBraintreePaypal, getCybersource } from './payment-methods.mock';
import PaymentStrategyRegistry from './payment-strategy-registry';

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
                'braintreepaypal',
            ],
        });
    });

    describe('#register()', () => {
        it('adds payment strategy to registry', () => {
            registry.register('creditcard', () => new CreditCardPaymentStrategy());

            expect(registry.getStrategy(getBraintree())).toBeInstanceOf(CreditCardPaymentStrategy);
        });

        it('passes method and gateway id to factory', () => {
            const factory = jest.fn(() => new CreditCardPaymentStrategy());
            const method = getBraintree();

            registry.register('creditcard', factory);
            registry.getStrategy(method);

            expect(factory).toHaveBeenCalledWith(method);
        });

        it('throws error if payment strategy is not found', () => {
            expect(() => registry.getStrategy(getBraintree())).toThrow(PaymentMethodUnsupportedError);
        });

        it('throws error if payment strategy is already registered with same name', () => {
            expect(() => registry.register('creditcard', () => new CreditCardPaymentStrategy())).not.toThrow();
            expect(() => registry.register('creditcard', () => new CreditCardPaymentStrategy())).toThrow(PaymentMethodNotRegistrableError);
        });
    });

    describe('#getStrategy()', () => {
        beforeEach(() => {
            registry.register('authorizenet', () => new AuthorizenetPaymentStrategy());
            registry.register('creditcard', () => new CreditCardPaymentStrategy());
            registry.register('legacy', () => new LegacyPaymentStrategy());
            registry.register('offline', () => new OfflinePaymentStrategy());
            registry.register('offsite', () => new OffsitePaymentStrategy());
        });

        it('returns strategy if registered with method name', () => {
            expect(registry.getStrategy(getAuthorizenet())).toBeInstanceOf(AuthorizenetPaymentStrategy);
        });

        it('returns credit card strategy if none is registered with method name', () => {
            expect(registry.getStrategy(getBraintree())).toBeInstanceOf(CreditCardPaymentStrategy);
        });

        it('returns new strategy instance if multiple methods belong to same type', () => {
            expect(registry.getStrategy(getBraintree())).toBeInstanceOf(CreditCardPaymentStrategy);
            expect(registry.getStrategy(getBraintreePaypal())).toBeInstanceOf(CreditCardPaymentStrategy);
            expect(registry.getStrategy(getBraintree())).not.toBe(registry.getStrategy(getBraintreePaypal()));
        });

        it('returns offsite strategy if none is registered with method name and method is hosted', () => {
            expect(registry.getStrategy(getAdyenAmex())).toBeInstanceOf(OffsitePaymentStrategy);
        });

        it('returns offline strategy if none is registered with method name and method is offline', () => {
            expect(registry.getStrategy(getBankDeposit())).toBeInstanceOf(OfflinePaymentStrategy);
        });

        it('returns legacy strategy if none is registered with method name and client-side payment is not supported by method', () => {
            expect(registry.getStrategy(getCybersource())).toBeInstanceOf(LegacyPaymentStrategy);
        });
    });
});
