import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceButtonStrategy from './big-commerce-button-strategy';
import createBigCommerceIntegrationService from './create-big-commerce-button-strategy';

describe('createPayPalCommerceButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce commerce button strategy', () => {
        const strategy = createBigCommerceIntegrationService(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommerceButtonStrategy);
    });
});
