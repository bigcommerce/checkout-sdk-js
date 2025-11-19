import { createClient as createPaymentClient } from '@bigcommerce/bigpay-client';
import { createRequestSender } from '@bigcommerce/request-sender';

import { createCheckoutStore } from '../checkout';

import createPaymentStrategyRegistry from './create-payment-strategy-registry';
import PaymentStrategyRegistry from './payment-strategy-registry';
import PaymentStrategyType from './payment-strategy-type';
import { ConvergePaymentStrategy } from './strategies/converge';
import { PPSDKStrategy } from './strategies/ppsdk';
import { WepayPaymentStrategy } from './strategies/wepay';

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

    it('can instantiate converge', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.CONVERGE);

        expect(paymentStrategy).toBeInstanceOf(ConvergePaymentStrategy);
    });

    it('can instantiate wepay', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.WE_PAY);

        expect(paymentStrategy).toBeInstanceOf(WepayPaymentStrategy);
    });

    it('can instantiate ppsdk', () => {
        const paymentStrategy = registry.get(PaymentStrategyType.PPSDK);

        expect(paymentStrategy).toBeInstanceOf(PPSDKStrategy);
    });
});
