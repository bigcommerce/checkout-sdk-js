import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsPayPalCustomerStrategy from './bigcommerce-payments-paypal-customer-strategy';
import createBigCommercePaymentsPayPalCustomerStrategy from './create-bigcommerce-payments-paypal-customer-strategy';

describe('createBigCommercePaymentsPayPalCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePaymentsPayPalCustomerStrategy customer strategy', () => {
        const strategy = createBigCommercePaymentsPayPalCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsPayPalCustomerStrategy);
    });
});
