import { createCheckoutStore, CheckoutStore, InternalCheckoutSelectors } from '../checkout';
import { getConfigState } from '../config/configs.mock';
import { OrderRequestBody } from '../order';
import { OrderFinalizationNotRequiredError } from '../order/errors';

import { getAdyenAmex, getAuthorizenet, getBankDeposit, getBraintree, getBraintreePaypal, getCybersource } from './payment-methods.mock';
import { PaymentInitializeOptions, PaymentRequestOptions } from './payment-request-options';
import PaymentStrategyRegistry from './payment-strategy-registry';
import { PaymentStrategy } from './strategies';

describe('PaymentStrategyRegistry', () => {
    let registry: PaymentStrategyRegistry;
    let store: CheckoutStore;

    class BasePaymentStrategy implements PaymentStrategy {
        constructor(
            private _store: CheckoutStore
        ) {}

        execute(payload: OrderRequestBody, options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
            return Promise.resolve(this._store.getState());
        }

        finalize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
            return Promise.reject(new OrderFinalizationNotRequiredError());
        }

        initialize(options?: PaymentInitializeOptions): Promise<InternalCheckoutSelectors> {
            return Promise.resolve(this._store.getState());
        }

        deinitialize(options?: PaymentRequestOptions): Promise<InternalCheckoutSelectors> {
            return Promise.resolve(this._store.getState());
        }
    }

    // tslint:disable-next-line:max-classes-per-file
    class CreditCardPaymentStrategy extends BasePaymentStrategy {}

    // tslint:disable-next-line:max-classes-per-file
    class LegacyPaymentStrategy extends BasePaymentStrategy {}

    // tslint:disable-next-line:max-classes-per-file
    class OfflinePaymentStrategy extends BasePaymentStrategy {}

    // tslint:disable-next-line:max-classes-per-file
    class OffsitePaymentStrategy extends BasePaymentStrategy {}

    // tslint:disable-next-line:max-classes-per-file
    class AuthorizenetPaymentStrategy extends BasePaymentStrategy {}

    beforeEach(() => {
        store = createCheckoutStore({
            config: getConfigState(),
        });

        registry = new PaymentStrategyRegistry(store);
    });

    describe('#getByMethod()', () => {
        beforeEach(() => {
            registry.register('authorizenet', () => new AuthorizenetPaymentStrategy(store));
            registry.register('creditcard', () => new CreditCardPaymentStrategy(store));
            registry.register('legacy', () => new LegacyPaymentStrategy(store));
            registry.register('offline', () => new OfflinePaymentStrategy(store));
            registry.register('offsite', () => new OffsitePaymentStrategy(store));
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
