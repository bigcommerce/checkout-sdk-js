import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createCBAMPGSPaymentStrategy from './create-cba-mpgs-payment-strategy';
import CBAMPGSPaymentStrategy from './cba-mpgs-payment-strategy';

describe('createCBAMPGSPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates CBAMPGS payment strategy', () => {
        const strategy = createCBAMPGSPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(CBAMPGSPaymentStrategy);
    });
});
