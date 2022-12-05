import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createExternalPaymentStrategy from './create-external-payment-strategy';
import ExternalPaymentStrategy from './external-payment-strategy';

describe('createExternalPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates external payment strategy', () => {
        const strategy = createExternalPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(ExternalPaymentStrategy);
    });
});
