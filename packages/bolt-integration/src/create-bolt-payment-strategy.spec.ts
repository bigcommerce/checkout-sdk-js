import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BoltPaymentStrategy from './bolt-payment-strategy';
import createBoltPaymentStrategy from './create-bolt-payment-strategy';

describe('createBoltPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
    });

    it('instantiates bolt payment strategy', () => {
        const strategy = createBoltPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BoltPaymentStrategy);
    });
});
