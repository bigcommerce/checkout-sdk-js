import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { createCheckoutStore } from '../checkout';
import { createSpamProtection } from '../spam-protection';

import createPaymentStrategyRegistry from './create-payment-strategy-registry';
import PaymentStrategyRegistry from './payment-strategy-registry';
import PaymentStrategyType from './payment-strategy-type';
import { AffirmPaymentStrategy } from './strategies/affirm';
import { AfterpayPaymentStrategy } from './strategies/afterpay';
import { AmazonPayPaymentStrategy } from './strategies/amazon-pay';
import { AmazonPayV2PaymentStrategy } from './strategies/amazon-pay-v2';
import { BarclaysPaymentStrategy } from './strategies/barclays';
import { BlueSnapV2PaymentStrategy } from './strategies/bluesnapv2';
import { BNZPaymentStrategy } from './strategies/bnz';
import {
    BraintreeCreditCardPaymentStrategy,
    BraintreePaypalPaymentStrategy,
    BraintreeVisaCheckoutPaymentStrategy,
} from './strategies/braintree';
import { CBAMPGSPaymentStrategy } from './strategies/cba-mpgs';
import { ChasepayPaymentStrategy } from './strategies/chasepay';
import {
    CheckoutcomAPMPaymentStrategy,
    CheckoutcomSEPAPaymentStrategy,
} from './strategies/checkoutcom-custom';
import { ClearpayPaymentStrategy } from './strategies/clearpay';
import { ConvergePaymentStrategy } from './strategies/converge';
import { CreditCardRedirectPaymentStrategy } from './strategies/credit-card-redirect';
import { CyberSourcePaymentStrategy } from './strategies/cybersource';
import { CyberSourceV2PaymentStrategy } from './strategies/cybersourcev2';
import { DigitalRiverPaymentStrategy } from './strategies/digitalriver';
import { GooglePayPaymentStrategy } from './strategies/googlepay';
import { HummPaymentStrategy } from './strategies/humm';
import { KlarnaPaymentStrategy } from './strategies/klarna';
import { LegacyPaymentStrategy } from './strategies/legacy';
import { MasterpassPaymentStrategy } from './strategies/masterpass';
import { OfflinePaymentStrategy } from './strategies/offline';
import { OffsitePaymentStrategy } from './strategies/offsite';
import { OpyPaymentStrategy } from './strategies/opy';
import { PaypalExpressPaymentStrategy, PaypalProPaymentStrategy } from './strategies/paypal';
import { PaypalCommercePaymentStrategy } from './strategies/paypal-commerce';
import { PPSDKStrategy } from './strategies/ppsdk';
import { QuadpayPaymentStrategy } from './strategies/quadpay';
import { SagePayPaymentStrategy } from './strategies/sage-pay';
import { SquarePaymentStrategy } from './strategies/square';
import { StripeUPEPaymentStrategy } from './strategies/stripe-upe';
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

        registry = createPaymentStrategyRegistry(
            store,
            paymentClient,
            requestSender,
            spamProtection,
            'en_US',
        );
    });

    it('can create a payment strategy registry', () => {
        expect(registry).toEqual(expect.any(PaymentStrategyRegistry));
    });

    it('can instantiate googlepayadyenv2', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.ADYENV2_GOOGLEPAY);

        expect(paymentStrategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });

    it('can instantiate googlepayadyenv3', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.ADYENV3_GOOGLEPAY);

        expect(paymentStrategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });

    it('can instantiate affirm', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.AFFIRM);

        expect(paymentStrategy).toBeInstanceOf(AffirmPaymentStrategy);
    });

    it('can instantiate amazon', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.AMAZON);

        expect(paymentStrategy).toBeInstanceOf(AmazonPayPaymentStrategy);
    });

    it('can instantiate amazonpay', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.AMAZONPAYV2);

        expect(paymentStrategy).toBeInstanceOf(AmazonPayV2PaymentStrategy);
    });

    it('can instantiate afterpay', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.AFTERPAY);

        expect(paymentStrategy).toBeInstanceOf(AfterpayPaymentStrategy);
    });

    it('can instantiate barclays', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.BARCLAYS);

        expect(paymentStrategy).toBeInstanceOf(BarclaysPaymentStrategy);
    });

    it('can instantiate braintree', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.BRAINTREE);

        expect(paymentStrategy).toBeInstanceOf(BraintreeCreditCardPaymentStrategy);
    });

    it('can instantiate APM', () => {
        const paymentStrategy = registry.get(
            PaymentStrategyType.PAYPAL_COMMERCE_ALTERNATIVE_METHODS,
        );

        expect(paymentStrategy).toBeInstanceOf(PaypalCommercePaymentStrategy);
    });

    it('can instantiate bluesnapv2', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.BLUESNAPV2);

        expect(paymentStrategy).toBeInstanceOf(BlueSnapV2PaymentStrategy);
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

    it('can instantiate checkout.com', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CHECKOUTCOM);

        expect(paymentStrategy).toBeInstanceOf(CreditCardRedirectPaymentStrategy);
    });

    it('can instantiate checkout.com apms', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CHECKOUTCOM_APM);

        expect(paymentStrategy).toBeInstanceOf(CheckoutcomAPMPaymentStrategy);
    });

    it('can instantiate checkout.com SEPA', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CHECKOUTCOM_SEPA);

        expect(paymentStrategy).toBeInstanceOf(CheckoutcomSEPAPaymentStrategy);
    });

    it('can instantiate clearpay', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CLEARPAY);

        expect(paymentStrategy).toBeInstanceOf(ClearpayPaymentStrategy);
    });

    it('can instantiate converge', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CONVERGE);

        expect(paymentStrategy).toBeInstanceOf(ConvergePaymentStrategy);
    });

    it('can instantiate cybersource', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CYBERSOURCE);

        expect(paymentStrategy).toBeInstanceOf(CyberSourcePaymentStrategy);
    });

    it('can instantiate cybersourcev2', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CYBERSOURCEV2);

        expect(paymentStrategy).toBeInstanceOf(CyberSourceV2PaymentStrategy);
    });

    it('can instantiate bankofnewzealand', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.BNZ);

        expect(paymentStrategy).toBeInstanceOf(BNZPaymentStrategy);
    });

    it('can instantiate googlepaybnz', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.BNZ_GOOGLEPAY);

        expect(paymentStrategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });

    it('can instantiate digitalRiver', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.DIGITALRIVER);

        expect(paymentStrategy).toBeInstanceOf(DigitalRiverPaymentStrategy);
    });

    it('can instantiate googlepaycybersourcev2', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CYBERSOURCEV2_GOOGLE_PAY);

        expect(paymentStrategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });

    it('can instantiate googlepayorbital', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.ORBITAL_GOOGLE_PAY);

        expect(paymentStrategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });

    it('can instantiate humm', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.HUMM);

        expect(paymentStrategy).toBeInstanceOf(HummPaymentStrategy);
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

    it('can instantiate openpay', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.OPY);

        expect(paymentStrategy).toBeInstanceOf(OpyPaymentStrategy);
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

    it('can instantiate quadpay', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.QUADPAY);

        expect(paymentStrategy).toBeInstanceOf(QuadpayPaymentStrategy);
    });

    it('can instantiate sagepay', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.SAGE_PAY);

        expect(paymentStrategy).toBeInstanceOf(SagePayPaymentStrategy);
    });

    it('can instantiate square', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.SQUARE);

        expect(paymentStrategy).toBeInstanceOf(SquarePaymentStrategy);
    });

    it('can instantiate googlepaybraintree', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.BRAINTREE_GOOGLE_PAY);

        expect(paymentStrategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });

    it('can instantiate googlepaycybersourcev2', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CYBERSOURCEV2_GOOGLE_PAY);

        expect(paymentStrategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });

    it('can instantiate googlepaystripe', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.STRIPE_GOOGLE_PAY);

        expect(paymentStrategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });

    it('can instantiate googlepaystripeupe', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.STRIPE_UPE_GOOGLE_PAY);

        expect(paymentStrategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });

    it('can instantiate stripev3', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.STRIPEV3);

        expect(paymentStrategy).toBeInstanceOf(StripeV3PaymentStrategy);
    });

    it('can instantiate stripe-upe', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.STRIPE_UPE);

        expect(paymentStrategy).toBeInstanceOf(StripeUPEPaymentStrategy);
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

    it('can instantiate ppsdk', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.PPSDK);

        expect(paymentStrategy).toBeInstanceOf(PPSDKStrategy);
    });

    it('can instantiate MPGS', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CBA_MPGS);

        expect(paymentStrategy).toBeInstanceOf(CBAMPGSPaymentStrategy);
    });
});
