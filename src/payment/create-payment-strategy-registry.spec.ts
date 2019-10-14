import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { createCheckoutStore } from '../checkout';
import { createSpamProtection } from '../order/spam-protection';

import createPaymentStrategyRegistry from './create-payment-strategy-registry';
import PaymentStrategyRegistry from './payment-strategy-registry';
import PaymentStrategyType from './payment-strategy-type';
import { AdyenV2PaymentStrategy } from './strategies/adyenv2';
import { AffirmPaymentStrategy } from './strategies/affirm';
import { AfterpayPaymentStrategy } from './strategies/afterpay';
import { AmazonPayPaymentStrategy } from './strategies/amazon-pay';
import { BraintreeCreditCardPaymentStrategy, BraintreePaypalPaymentStrategy, BraintreeVisaCheckoutPaymentStrategy } from './strategies/braintree';
import { ChasepayPaymentStrategy } from './strategies/chasepay';
import { ConvergePaymentStrategy } from './strategies/converge';
import { CreditCardPaymentStrategy } from './strategies/credit-card';
import { CyberSourcePaymentStrategy } from './strategies/cybersource';
import { GooglePayPaymentStrategy } from './strategies/googlepay';
import { KlarnaPaymentStrategy } from './strategies/klarna';
import { LegacyPaymentStrategy } from './strategies/legacy';
import { MasterpassPaymentStrategy } from './strategies/masterpass';
import { NoPaymentDataRequiredPaymentStrategy } from './strategies/no-payment';
import { OfflinePaymentStrategy } from './strategies/offline';
import { OffsitePaymentStrategy } from './strategies/offsite';
import { PaypalExpressPaymentStrategy, PaypalProPaymentStrategy } from './strategies/paypal';
import { SagePayPaymentStrategy } from './strategies/sage-pay';
import { SquarePaymentStrategy } from './strategies/square';
import { StripeV3PaymentStrategy } from './strategies/stripev3';
import { WepayPaymentStrategy } from './strategies/wepay';
import { ZipPaymentStrategy } from './strategies/zip';

describe('CreatePaymentStrategyRegistry', () => {
    let registry: PaymentStrategyRegistry;

    beforeEach(() => {
        const store = createCheckoutStore();
        const requestSender = createRequestSender();
        const paymentClient = createPaymentClient();
        const spamProtection = createSpamProtection(createScriptLoader());
        registry = createPaymentStrategyRegistry(store, paymentClient, requestSender, spamProtection, 'en_US');
    });

    it('can create a payment strategy registry', () => {
        expect(registry).toEqual(expect.any(PaymentStrategyRegistry));
    });

    it('can instantiate adyenv2', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.ADYENV2);
        expect(paymentStrategy).toBeInstanceOf(AdyenV2PaymentStrategy);
    });

    it('can instantiate affirm', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.AFFIRM);
        expect(paymentStrategy).toBeInstanceOf(AffirmPaymentStrategy);
    });

    it('can instantiate amazon', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.AMAZON);
        expect(paymentStrategy).toBeInstanceOf(AmazonPayPaymentStrategy);
    });

    it('can instantiate afterpay', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.AFTERPAY);
        expect(paymentStrategy).toBeInstanceOf(AfterpayPaymentStrategy);
    });

    it('can instantiate braintree', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.BRAINTREE);
        expect(paymentStrategy).toBeInstanceOf(BraintreeCreditCardPaymentStrategy);
    });

    it('can instantiate braintreepaypal', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.BRAINTREE_PAYPAL);
        expect(paymentStrategy).toBeInstanceOf(BraintreePaypalPaymentStrategy);
    });

    it('can instantiate braintreepaypaylcredit', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.BRAINTREE_PAYPAL_CREDIT);
        expect(paymentStrategy).toBeInstanceOf(BraintreePaypalPaymentStrategy);
    });

    it('can instantiate braintreevisacheckout', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.BRAINTREE_VISA_CHECKOUT);
        expect(paymentStrategy).toBeInstanceOf(BraintreeVisaCheckoutPaymentStrategy);
    });

    it('can instantiate chasepay', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CHASE_PAY);
        expect(paymentStrategy).toBeInstanceOf(ChasepayPaymentStrategy);
    });

    it('can instantiate converge', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CONVERGE);
        expect(paymentStrategy).toBeInstanceOf(ConvergePaymentStrategy);
    });

    it('can instantiate creditcard', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CREDIT_CARD);
        expect(paymentStrategy).toBeInstanceOf(CreditCardPaymentStrategy);
    });

    it('can instantiate cybersource', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CYBERSOURCE);
        expect(paymentStrategy).toBeInstanceOf(CyberSourcePaymentStrategy);
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

    it('can instantiate googlepaystripe', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.STRIPE_GOOGLE_PAY);
        expect(paymentStrategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });

    it('can instantiate stripev3', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.STRIPEV3);
        expect(paymentStrategy).toBeInstanceOf(StripeV3PaymentStrategy);
    });

    it('can instantiate wepay', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.WE_PAY);
        expect(paymentStrategy).toBeInstanceOf(WepayPaymentStrategy);
    });

    it('can instantiate masterpass', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.MASTERPASS);
        expect(paymentStrategy).toBeInstanceOf(MasterpassPaymentStrategy);
    });

    it('can instantiate zip', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.ZIP);
        expect(paymentStrategy).toBeInstanceOf(ZipPaymentStrategy);
    });
});
