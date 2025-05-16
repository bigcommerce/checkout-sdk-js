import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsVenmoPaymentStrategy from './bigcommerce-payments-venmo-payment-strategy';
import createBigCommercePaymentsVenmoPaymentStrategy from './create-bigcommerce-payments-venmo-payment-strategy';

describe('createBigCommercePaymentsVenmoPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments venmo payment strategy', () => {
        const strategy = createBigCommercePaymentsVenmoPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsVenmoPaymentStrategy);
    });
});
