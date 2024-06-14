import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import ClearpayPaymentStrategy from './clearpay-payment-strategy';
import createClearpayPaymentStrategy from './create-clearpay-payment-strategy';

describe('createClearpayPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates Clearpay payment strategy', () => {
        const strategy = createClearpayPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(ClearpayPaymentStrategy);
    });
});
