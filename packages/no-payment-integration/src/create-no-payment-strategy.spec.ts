import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createNoPaymentStrategy from './create-no-payment-strategy';
import NoPaymentDataRequiredPaymentStrategy from './no-payment-data-required-strategy';

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
