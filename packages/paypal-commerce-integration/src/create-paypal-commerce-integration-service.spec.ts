import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommerceIntegrationService from './create-paypal-commerce-integration-service';
import PayPalCommerceIntegrationService from './paypal-commerce-integration-service';

describe('createPayPalCommerceIntegrationService', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
    });

    it('instantiates PayPal commerce integration service', () => {
        const service = createPayPalCommerceIntegrationService(paymentIntegrationService);

        expect(service).toBeInstanceOf(PayPalCommerceIntegrationService);
    });
});
