import { set } from 'lodash';

import { createCheckoutStore, CheckoutStore, InternalCheckoutSelectors } from '../checkout';
import { getConfigState } from '../config/configs.mock';
import { getFormFieldsState } from '../form/form.mock';
import { OrderFinalizationNotRequiredError } from '../order/errors';

import { getAdyenAmex, getAmazonPay, getBankDeposit, getBraintree, getBraintreePaypal, getCybersource, getPPSDK } from './payment-methods.mock';
import PaymentStrategyRegistry from './payment-strategy-registry';
import PaymentStrategyType from './payment-strategy-type';
import { PaymentStrategy } from './strategies';

describe('PaymentStrategyRegistry', () => {
    let registry: PaymentStrategyRegistry;
    let store: CheckoutStore;

    class BasePaymentStrategy implements PaymentStrategy {
        constructor(
            private _store: CheckoutStore
        ) {}

        execute(): Promise<InternalCheckoutSelectors> {
            return Promise.resolve(this._store.getState());
        }

        finalize(): Promise<InternalCheckoutSelectors> {
            return Promise.reject(new OrderFinalizationNotRequiredError());
        }

        initialize(): Promise<InternalCheckoutSelectors> {
            return Promise.resolve(this._store.getState());
        }

        deinitialize(): Promise<InternalCheckoutSelectors> {
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
    class AmazonPayPaymentStrategy extends BasePaymentStrategy {}

    // tslint:disable-next-line:max-classes-per-file
    class PPSDKPaymentStrategy extends BasePaymentStrategy {}

    beforeEach(() => {
        store = createCheckoutStore({
            config: getConfigState(),
            formFields: getFormFieldsState(),
        });

        registry = new PaymentStrategyRegistry(store);
    });

    describe('#getByMethod()', () => {
        beforeEach(() => {
            registry.register(PaymentStrategyType.AMAZON, () => new AmazonPayPaymentStrategy(store));
            registry.register(PaymentStrategyType.CREDIT_CARD, () => new CreditCardPaymentStrategy(store));
            registry.register(PaymentStrategyType.LEGACY, () => new LegacyPaymentStrategy(store));
            registry.register(PaymentStrategyType.OFFLINE, () => new OfflinePaymentStrategy(store));
            registry.register(PaymentStrategyType.OFFSITE, () => new OffsitePaymentStrategy(store));
            registry.register(PaymentStrategyType.PPSDK, () => new PPSDKPaymentStrategy(store));
        });

        describe('PAYMENTS-6806.enable_ppsdk_strategy feature flag is off', () => {
            it('does not return ppsdk strategy if type is "PAYMENT_TYPE_SDK"', () => {
                expect(registry.getByMethod(getPPSDK())).not.toBeInstanceOf(PPSDKPaymentStrategy);
            });
        });

        describe('PAYMENTS-6806.enable_ppsdk_strategy feature flag is on', () => {
            const featureFlagPath = 'data.storeConfig.checkoutSettings.features';
            const flagValues = { 'PAYMENTS-6806.enable_ppsdk_strategy': true };

            const store = createCheckoutStore({
                config: set(getConfigState(), featureFlagPath, flagValues),
                formFields: getFormFieldsState(),
            });

            const registry = new PaymentStrategyRegistry(store);

            registry.register(PaymentStrategyType.LEGACY, () => new LegacyPaymentStrategy(store));
            registry.register(PaymentStrategyType.PPSDK, () => new PPSDKPaymentStrategy(store));

            it('returns ppsdk strategy if type is "PAYMENT_TYPE_SDK"', () => {
                expect(registry.getByMethod(getPPSDK())).toBeInstanceOf(PPSDKPaymentStrategy);
            });
        });

        it('returns strategy if registered with method name', () => {
            expect(registry.getByMethod(getAmazonPay())).toBeInstanceOf(AmazonPayPaymentStrategy);
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
