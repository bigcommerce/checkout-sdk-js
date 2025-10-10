import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';

import createPaymentStrategyRegistry from './create-payment-strategy-registry';
import PaymentStrategyRegistry from './payment-strategy-registry';
import PaymentStrategyType from './payment-strategy-type';
import { BarclaysPaymentStrategy } from './strategies/barclays';
import { BNZPaymentStrategy } from './strategies/bnz';
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

        registry = createPaymentStrategyRegistry(store, paymentClient, requestSender, 'en_US');
    });

    it('can create a payment strategy registry', () => {
        expect(registry).toEqual(expect.any(PaymentStrategyRegistry));
    });

    it('can instantiate barclays', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.BARCLAYS);

        expect(paymentStrategy).toBeInstanceOf(BarclaysPaymentStrategy);
    });

    it('can instantiate converge', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CONVERGE);

        expect(paymentStrategy).toBeInstanceOf(ConvergePaymentStrategy);
    });

    it('can instantiate bankofnewzealand', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.BNZ);

        expect(paymentStrategy).toBeInstanceOf(BNZPaymentStrategy);
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
