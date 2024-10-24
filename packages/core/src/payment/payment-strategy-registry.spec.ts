import { getAmazonPayV2 } from '@bigcommerce/checkout-sdk/amazon-pay-utils';

import { CheckoutStore, createCheckoutStore, InternalCheckoutSelectors } from '../checkout';
import { InvalidArgumentError } from '../common/error/errors';
import { getConfigState } from '../config/configs.mock';
import { getFormFieldsState } from '../form/form.mock';
import { OrderFinalizationNotRequiredError } from '../order/errors';

import { getBankDeposit, getBraintree, getPPSDK } from './payment-methods.mock';
import PaymentStrategyRegistry from './payment-strategy-registry';
import PaymentStrategyType from './payment-strategy-type';
import { PaymentStrategy } from './strategies';

describe('PaymentStrategyRegistry', () => {
    let registry: PaymentStrategyRegistry;
    let store: CheckoutStore;

    class BasePaymentStrategy implements PaymentStrategy {
        constructor(private _store: CheckoutStore) {}

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
    class OfflinePaymentStrategy extends BasePaymentStrategy {}

    // tslint:disable-next-line:max-classes-per-file
    class AmazonPayV2PaymentStrategy extends BasePaymentStrategy {}

    // tslint:disable-next-line:max-classes-per-file
    class PPSDKPaymentStrategy extends BasePaymentStrategy {}

    beforeEach(() => {
        store = createCheckoutStore({
            config: getConfigState(),
            formFields: getFormFieldsState(),
        });

        registry = new PaymentStrategyRegistry();
    });

    describe('#getByMethod()', () => {
        beforeEach(() => {
            registry.register(
                PaymentStrategyType.AMAZONPAY,
                () => new AmazonPayV2PaymentStrategy(store),
            );
            registry.register(
                PaymentStrategyType.CREDIT_CARD,
                () => new CreditCardPaymentStrategy(store),
            );

            registry.register(PaymentStrategyType.OFFLINE, () => new OfflinePaymentStrategy(store));
            registry.register(PaymentStrategyType.PPSDK, () => new PPSDKPaymentStrategy(store));
        });

        it('returns ppsdk strategy if type is "PAYMENT_TYPE_SDK"', () => {
            expect(registry.getByMethod(getPPSDK())).toBeInstanceOf(PPSDKPaymentStrategy);
        });

        it('returns strategy if registered with method name', () => {
            expect(registry.getByMethod(getAmazonPayV2())).toBeInstanceOf(
                AmazonPayV2PaymentStrategy,
            );
        });

        it('throws error if none is registered with method name (expected V1 behavior)', () => {
            expect(() => registry.getByMethod(getBraintree())).toThrow(InvalidArgumentError);
        });

        it('returns offline strategy if none is registered with method name and method is offline', () => {
            expect(registry.getByMethod(getBankDeposit())).toBeInstanceOf(OfflinePaymentStrategy);
        });
    });
});
