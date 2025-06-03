import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsPayPalButtonStrategy from './bigcommerce-payments-paypal-button-strategy';
import createBigCommercePaymentsPaypalButtonStrategy from './create-bigcommerce-payments-paypal-button-strategy';

describe('createBigCommercePaymentsPaypalButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePaymentsPayPalButtonStrategy', () => {
        const strategy = createBigCommercePaymentsPaypalButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsPayPalButtonStrategy);
    });
});
