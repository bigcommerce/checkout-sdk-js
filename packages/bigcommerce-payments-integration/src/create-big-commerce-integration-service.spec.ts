import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceIntegrationService from './big-commerce-integration-service';
import createBigCommerceIntegrationService from './create-big-commerce-integration-service';

describe('createBigCommerceIntegrationService', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommerce commerce integration service', () => {
        const service = createBigCommerceIntegrationService(paymentIntegrationService);

        expect(service).toBeInstanceOf(BigCommerceIntegrationService);
    });
});
