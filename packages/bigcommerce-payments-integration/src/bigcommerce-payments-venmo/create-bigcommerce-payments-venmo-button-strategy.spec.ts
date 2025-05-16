import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsVenmoButtonStrategy from './bigcommerce-payments-venmo-button-strategy';
import createBigCommercePaymentsVenmoButtonStrategy from './create-bigcommerce-payments-venmo-button-strategy';

describe('createBigCommercePaymentsVenmoButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments venmo button strategy', () => {
        const strategy = createBigCommercePaymentsVenmoButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsVenmoButtonStrategy);
    });
});
