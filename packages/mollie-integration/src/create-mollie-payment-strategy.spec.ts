import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createMolliePaymentStrategy from './create-mollie-payment-strategy';
import MolliePaymentStrategy from './mollie-payment-strategy';

describe('createMolliePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates mollie payment strategy', () => {
        const strategy = createMolliePaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(MolliePaymentStrategy);
    });
});
