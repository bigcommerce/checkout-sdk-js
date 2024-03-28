import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createHummPaymentStrategy from './create-humm-payment-strategy';
import HummPaymentStrategy from './humm-payment-strategy';

describe('createHummPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates Humm payment strategy', () => {
        const strategy = createHummPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(HummPaymentStrategy);
    });
});
