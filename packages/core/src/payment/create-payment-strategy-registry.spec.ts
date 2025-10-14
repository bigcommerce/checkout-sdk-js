import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createRequestSender } from '@bigcommerce/request-sender';
import { createScriptLoader } from '@bigcommerce/script-loader';

import { createCheckoutStore } from '../checkout';
import { ErrorLogger } from '../common/error';
import { createSpamProtection } from '../spam-protection';

import createPaymentStrategyRegistry from './create-payment-strategy-registry';
import PaymentStrategyRegistry from './payment-strategy-registry';
import PaymentStrategyType from './payment-strategy-type';
import { BraintreeVisaCheckoutPaymentStrategy } from './strategies/braintree';
import { CBAMPGSPaymentStrategy } from './strategies/cba-mpgs';
import { ConvergePaymentStrategy } from './strategies/converge';
import { MasterpassPaymentStrategy } from './strategies/masterpass';
import { PaypalExpressPaymentStrategy } from './strategies/paypal';
import { PPSDKStrategy } from './strategies/ppsdk';
import { WepayPaymentStrategy } from './strategies/wepay';

describe('CreatePaymentStrategyRegistry', () => {
    let registry: PaymentStrategyRegistry;

    beforeEach(() => {
        const store = createCheckoutStore();
        const requestSender = createRequestSender();
        const paymentClient = createPaymentClient();
        const spamProtection = createSpamProtection(createScriptLoader());
        const errorLogger: ErrorLogger = { log: jest.fn() };

        registry = createPaymentStrategyRegistry(
            store,
            paymentClient,
            requestSender,
            spamProtection,
            'en_US',
            errorLogger,
        );
    });

    it('can create a payment strategy registry', () => {
        expect(registry).toEqual(expect.any(PaymentStrategyRegistry));
    });

    it('can instantiate braintreevisacheckout', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.BRAINTREE_VISA_CHECKOUT);

        expect(paymentStrategy).toBeInstanceOf(BraintreeVisaCheckoutPaymentStrategy);
    });

    it('can instantiate converge', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CONVERGE);

        expect(paymentStrategy).toBeInstanceOf(ConvergePaymentStrategy);
    });

    it('can instantiate paypalexpress', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.PAYPAL_EXPRESS);

        expect(paymentStrategy).toBeInstanceOf(PaypalExpressPaymentStrategy);
    });

    it('can instantiate paypalexpresscredit', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.PAYPAL_EXPRESS_CREDIT);

        expect(paymentStrategy).toBeInstanceOf(PaypalExpressPaymentStrategy);
    });

    it('can instantiate wepay', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.WE_PAY);

        expect(paymentStrategy).toBeInstanceOf(WepayPaymentStrategy);
    });

    it('can instantiate masterpass', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.MASTERPASS);

        expect(paymentStrategy).toBeInstanceOf(MasterpassPaymentStrategy);
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
