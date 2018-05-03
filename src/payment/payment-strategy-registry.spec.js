import { getAdyenAmex, getAuthorizenet, getBankDeposit, getBraintree, getBraintreePaypal, getCybersource } from './payment-methods.mock';
import PaymentStrategyRegistry from './payment-strategy-registry';
import { createCheckoutStore } from '../checkout';
import { getConfigState } from '../config/configs.mock';

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
        const store = createCheckoutStore({
            config: getConfigState(),
        });

        registry = new PaymentStrategyRegistry(store);
    });

    describe('#getByMethod()', () => {
        beforeEach(() => {
            registry.register('authorizenet', () => new AuthorizenetPaymentStrategy());
            registry.register('creditcard', () => new CreditCardPaymentStrategy());
            registry.register('legacy', () => new LegacyPaymentStrategy());
            registry.register('offline', () => new OfflinePaymentStrategy());
            registry.register('offsite', () => new OffsitePaymentStrategy());
        });

        it('returns strategy if registered with method name', () => {
            expect(registry.getByMethod(getAuthorizenet())).toBeInstanceOf(AuthorizenetPaymentStrategy);
        });

        it('returns credit card strategy if none is registered with method name', () => {
            expect(registry.getByMethod(getBraintree())).toBeInstanceOf(CreditCardPaymentStrategy);
        });

        it('returns new strategy instance if multiple methods belong to same type', () => {
            expect(registry.getByMethod(getBraintree())).toBeInstanceOf(CreditCardPaymentStrategy);
            expect(registry.getByMethod(getBraintreePaypal())).toBeInstanceOf(CreditCardPaymentStrategy);
            expect(registry.getByMethod(getBraintree())).not.toBe(registry.getByMethod(getBraintreePaypal()));
        });

        it('returns offsite strategy if none is registered with method name and method is hosted', () => {
            expect(registry.getByMethod(getAdyenAmex())).toBeInstanceOf(OffsitePaymentStrategy);
        });

        it('returns offline strategy if none is registered with method name and method is offline', () => {
            expect(registry.getByMethod(getBankDeposit())).toBeInstanceOf(OfflinePaymentStrategy);
        });

        it('returns legacy strategy if none is registered with method name and client-side payment is not supported by method', () => {
            expect(registry.getByMethod(getCybersource())).toBeInstanceOf(LegacyPaymentStrategy);
        });
    });
});
