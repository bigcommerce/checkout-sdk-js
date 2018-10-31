import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';

import createPaymentStrategyRegistry from './create-payment-strategy-registry';
import PaymentStrategyRegistry from './payment-strategy-registry';
import {
    AfterpayPaymentStrategy,
    AmazonPayPaymentStrategy,
    CreditCardPaymentStrategy,
    GooglePayPaymentStrategy,
    KlarnaPaymentStrategy,
    LegacyPaymentStrategy,
    NoPaymentDataRequiredPaymentStrategy,
    OfflinePaymentStrategy,
    OffsitePaymentStrategy,
    PaypalExpressPaymentStrategy,
    PaypalProPaymentStrategy,
    SagePayPaymentStrategy,
    SquarePaymentStrategy,
} from './strategies';

describe('CreatePaymentStrategyRegistry', () => {
    let registry: PaymentStrategyRegistry;

    beforeEach(() => {
        const store = createCheckoutStore();
        const requestSender = createRequestSender();
        const paymentClient = createPaymentClient();
        registry = createPaymentStrategyRegistry(store, paymentClient, requestSender);
    });

    it('can create a payment strategy registry', () => {
        expect(registry).toEqual(expect.any(PaymentStrategyRegistry));
    });

    it('can instantiate amazon', () => {
        const paymentStrategy = registry.get('amazon');
        expect(paymentStrategy).toBeInstanceOf(AmazonPayPaymentStrategy);
    });

    it('can instantiate afterpay', () => {
        const paymentStrategy = registry.get('afterpay');
        expect(paymentStrategy).toBeInstanceOf(AfterpayPaymentStrategy);
    });

    it('can instantiate creditcard', () => {
        const paymentStrategy = registry.get('creditcard');
        expect(paymentStrategy).toBeInstanceOf(CreditCardPaymentStrategy);
    });

    it('can instantiate klarna', () => {
        const paymentStrategy = registry.get('klarna');
        expect(paymentStrategy).toBeInstanceOf(KlarnaPaymentStrategy);
    });

    it('can instantiate legacy', () => {
        const paymentStrategy = registry.get('legacy');
        expect(paymentStrategy).toBeInstanceOf(LegacyPaymentStrategy);
    });

    it('can instantiate offline', () => {
        const paymentStrategy = registry.get('offline');
        expect(paymentStrategy).toBeInstanceOf(OfflinePaymentStrategy);
    });

    it('can instantiate offsite', () => {
        const paymentStrategy = registry.get('offsite');
        expect(paymentStrategy).toBeInstanceOf(OffsitePaymentStrategy);
    });

    it('can instantiate paypal', () => {
        const paymentStrategy = registry.get('paypal');
        expect(paymentStrategy).toBeInstanceOf(PaypalProPaymentStrategy);
    });

    it('can instantiate paypalexpress', () => {
        const paymentStrategy = registry.get('paypalexpress');
        expect(paymentStrategy).toBeInstanceOf(PaypalExpressPaymentStrategy);
    });

    it('can instantiate paypalexpresscredit', () => {
        const paymentStrategy = registry.get('paypalexpresscredit');
        expect(paymentStrategy).toBeInstanceOf(PaypalExpressPaymentStrategy);
    });

    it('can instantiate sagepay', () => {
        const paymentStrategy = registry.get('sagepay');
        expect(paymentStrategy).toBeInstanceOf(SagePayPaymentStrategy);
    });

    it('can instantiate square', () => {
        const paymentStrategy = registry.get('squarev2');
        expect(paymentStrategy).toBeInstanceOf(SquarePaymentStrategy);
    });

    it('can instantiate nopaymentdatarequired', () => {
        const paymentStrategy = registry.get('nopaymentdatarequired');
        expect(paymentStrategy).toBeInstanceOf(NoPaymentDataRequiredPaymentStrategy);
    });

    it('can instantiate googlepaybraintree', () => {
        const paymentStrategy = registry.get('googlepaybraintree');
        expect(paymentStrategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });
});
