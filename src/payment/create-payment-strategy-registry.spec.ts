import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';

import createPaymentStrategyRegistry from './create-payment-strategy-registry';
import PaymentStrategyRegistry from './payment-strategy-registry';
import PaymentStrategyType from './payment-strategy-type';
import { AfterpayPaymentStrategy } from './strategies/afterpay';
import { AmazonPayPaymentStrategy } from './strategies/amazon-pay';
import { ConvergePaymentStrategy } from './strategies/converge';
import { CreditCardPaymentStrategy } from './strategies/credit-card';
import { GooglePayPaymentStrategy } from './strategies/googlepay';
import { KlarnaPaymentStrategy } from './strategies/klarna';
import { LegacyPaymentStrategy } from './strategies/legacy';
import { NoPaymentDataRequiredPaymentStrategy } from './strategies/no-payment';
import { OfflinePaymentStrategy } from './strategies/offline';
import { OffsitePaymentStrategy } from './strategies/offsite';
import { PaypalExpressPaymentStrategy, PaypalProPaymentStrategy } from './strategies/paypal';
import { SagePayPaymentStrategy } from './strategies/sage-pay';
import { SquarePaymentStrategy } from './strategies/square';

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
        const paymentStrategy = registry.get(PaymentStrategyType.AMAZON);
        expect(paymentStrategy).toBeInstanceOf(AmazonPayPaymentStrategy);
    });

    it('can instantiate afterpay', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.AFTERPAY);
        expect(paymentStrategy).toBeInstanceOf(AfterpayPaymentStrategy);
    });

    it('can instantiate creditcard', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CREDIT_CARD);
        expect(paymentStrategy).toBeInstanceOf(CreditCardPaymentStrategy);
    });

    it('can instantiate klarna', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.KLARNA);
        expect(paymentStrategy).toBeInstanceOf(KlarnaPaymentStrategy);
    });

    it('can instantiate legacy', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.LEGACY);
        expect(paymentStrategy).toBeInstanceOf(LegacyPaymentStrategy);
    });

    it('can instantiate offline', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.OFFLINE);
        expect(paymentStrategy).toBeInstanceOf(OfflinePaymentStrategy);
    });

    it('can instantiate offsite', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.OFFSITE);
        expect(paymentStrategy).toBeInstanceOf(OffsitePaymentStrategy);
    });

    it('can instantiate paypal', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.PAYPAL);
        expect(paymentStrategy).toBeInstanceOf(PaypalProPaymentStrategy);
    });

    it('can instantiate paypalexpress', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.PAYPAL_EXPRESS);
        expect(paymentStrategy).toBeInstanceOf(PaypalExpressPaymentStrategy);
    });

    it('can instantiate paypalexpresscredit', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.PAYPAL_EXPRESS_CREDIT);
        expect(paymentStrategy).toBeInstanceOf(PaypalExpressPaymentStrategy);
    });

    it('can instantiate sagepay', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.SAGE_PAY);
        expect(paymentStrategy).toBeInstanceOf(SagePayPaymentStrategy);
    });

    it('can instantiate square', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.SQUARE);
        expect(paymentStrategy).toBeInstanceOf(SquarePaymentStrategy);
    });

    it('can instantiate nopaymentdatarequired', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.NO_PAYMENT_DATA_REQUIRED);
        expect(paymentStrategy).toBeInstanceOf(NoPaymentDataRequiredPaymentStrategy);
    });

    it('can instantiate googlepaybraintree', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.BRAINTREE_GOOGLE_PAY);
        expect(paymentStrategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });

    it('can instantiate converge', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CONVERGE);
        expect(paymentStrategy).toBeInstanceOf(ConvergePaymentStrategy);
    });
});
