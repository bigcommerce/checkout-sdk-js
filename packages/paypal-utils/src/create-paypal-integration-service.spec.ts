import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalIntegrationService from './create-paypal-integration-service';
import PaypalIntegrationService from './paypal-integration-service';

describe('createPayPalIntegrationService', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates PayPal integration service', () => {
        const service = createPayPalIntegrationService(paymentIntegrationService);

        expect(service).toBeInstanceOf(PaypalIntegrationService);
    });
});
