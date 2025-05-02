import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceVenmoPaymentStrategy from './big-commerce-venmo-payment-strategy';
import createBigCommerceVenmoPaymentStrategy from './create-big-commerce-venmo-payment-strategy';

describe('createBigCommerceVenmoPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce venmo payment strategy', () => {
        const strategy = createBigCommerceVenmoPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommerceVenmoPaymentStrategy);
    });
});
