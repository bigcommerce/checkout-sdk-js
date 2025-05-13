import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsIntegrationService from './bigcommerce-payments-integration-service';
import createBigCommercePaymentsIntegrationService from './create-bigcommerce-payments-integration-service';

describe('createBigCommercePaymentsIntegrationService', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments integration service', () => {
        const service = createBigCommercePaymentsIntegrationService(paymentIntegrationService);

        expect(service).toBeInstanceOf(BigCommercePaymentsIntegrationService);
    });
});
