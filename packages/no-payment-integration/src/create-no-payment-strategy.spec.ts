import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { createNoPaymentStrategy, NoPaymentDataRequiredPaymentStrategy } from '.';

describe('createNoPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates no payment data required strategy', () => {
        const strategy = createNoPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(NoPaymentDataRequiredPaymentStrategy);
    });
});
