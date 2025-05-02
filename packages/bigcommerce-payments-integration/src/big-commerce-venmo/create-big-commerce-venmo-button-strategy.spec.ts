import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceVenmoButtonStrategy from './big-commerce-venmo-button-strategy';
import createBigCommerceVenmoButtonStrategy from './create-big-commerce-venmo-button-strategy';

describe('createBigCommerceVenmoButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce venmo button strategy', () => {
        const strategy = createBigCommerceVenmoButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommerceVenmoButtonStrategy);
    });
});
