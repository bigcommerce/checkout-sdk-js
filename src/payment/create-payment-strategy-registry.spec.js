import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';

import { createPaymentStrategyRegistry } from '.';
import { createCheckoutClient, createCheckoutStore } from '../checkout';
import PaymentStrategyRegistry from './payment-strategy-registry';
import {
    AfterpayPaymentStrategy,
    AmazonPayPaymentStrategy,
    CreditCardPaymentStrategy,
    KlarnaPaymentStrategy,
    LegacyPaymentStrategy,
    NoPaymentDataRequiredPaymentStrategy,
    OfflinePaymentStrategy,
    OffsitePaymentStrategy,
    PaypalExpressPaymentStrategy,
    PaypalProPaymentStrategy,
    SagePayPaymentStrategy,
} from './strategies';

describe('CreatePaymentStrategyRegistry', () => {
    let registry;

    beforeEach(() => {
        const store = createCheckoutStore();
        const client = createCheckoutClient();
        const paymentClient = createPaymentClient();
        registry = createPaymentStrategyRegistry(store, client, paymentClient);
    });

    it('can create a payment strategy registry', () => {
        expect(registry).toEqual(expect.any(PaymentStrategyRegistry));
    });

    it('can instanciate amazon', () => {
        const paymentStrategy = registry.get('amazon');
        expect(paymentStrategy).toBeInstanceOf(AmazonPayPaymentStrategy);
    });

    it('can instanciate afterpay', () => {
        const paymentStrategy = registry.get('afterpay');
        expect(paymentStrategy).toBeInstanceOf(AfterpayPaymentStrategy);
    });

    it('can instanciate creditcard', () => {
        const paymentStrategy = registry.get('creditcard');
        expect(paymentStrategy).toBeInstanceOf(CreditCardPaymentStrategy);
    });

    it('can instanciate klarna', () => {
        const paymentStrategy = registry.get('klarna');
        expect(paymentStrategy).toBeInstanceOf(KlarnaPaymentStrategy);
    });

    it('can instanciate legacy', () => {
        const paymentStrategy = registry.get('legacy');
        expect(paymentStrategy).toBeInstanceOf(LegacyPaymentStrategy);
    });

    it('can instanciate offline', () => {
        const paymentStrategy = registry.get('offline');
        expect(paymentStrategy).toBeInstanceOf(OfflinePaymentStrategy);
    });

    it('can instanciate offsite', () => {
        const paymentStrategy = registry.get('offsite');
        expect(paymentStrategy).toBeInstanceOf(OffsitePaymentStrategy);
    });

    it('can instanciate paypal', () => {
        const paymentStrategy = registry.get('paypal');
        expect(paymentStrategy).toBeInstanceOf(PaypalProPaymentStrategy);
    });

    it('can instanciate paypalexpress', () => {
        const paymentStrategy = registry.get('paypalexpress');
        expect(paymentStrategy).toBeInstanceOf(PaypalExpressPaymentStrategy);
    });

    it('can instanciate paypalexpresscredit', () => {
        const paymentStrategy = registry.get('paypalexpresscredit');
        expect(paymentStrategy).toBeInstanceOf(PaypalExpressPaymentStrategy);
    });

    it('can instanciate sagepay', () => {
        const paymentStrategy = registry.get('sagepay');
        expect(paymentStrategy).toBeInstanceOf(SagePayPaymentStrategy);
    });

    it('can instanciate nopaymentdatarequired', () => {
        const paymentStrategy = registry.get('nopaymentdatarequired');
        expect(paymentStrategy).toBeInstanceOf(NoPaymentDataRequiredPaymentStrategy);
    });
});
