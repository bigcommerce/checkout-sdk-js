import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BoltButtonStrategy from './bolt-button-strategy';
import createBoltButtonStrategy from './create-bolt-button-strategy';

describe('createBoltButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
    });

    it('instantiates bolt button strategy', () => {
        const strategy = createBoltButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BoltButtonStrategy);
    });
});
