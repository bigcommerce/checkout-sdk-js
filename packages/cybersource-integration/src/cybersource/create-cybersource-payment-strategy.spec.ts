import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createCybersourcePaymentStrategy from './create-cybersource-payment-strategy';
import CyberSourcePaymentStrategy from './cybersource-payment-strategy';

describe('createCyberSourcePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates cybersource payment strategy', () => {
        const strategy = createCybersourcePaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(CyberSourcePaymentStrategy);
    });
});
