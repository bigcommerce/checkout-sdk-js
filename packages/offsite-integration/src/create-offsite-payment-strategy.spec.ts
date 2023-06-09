import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createOffsitePaymentStrategy from './create-offsite-payment-strategy';
import OffsitePaymentStrategy from './offsite-payment-strategy';

describe('createOffsitePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates offsite payment strategy', () => {
        const strategy = createOffsitePaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(OffsitePaymentStrategy);
    });
});
