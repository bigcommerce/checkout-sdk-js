import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceCreditCustomerStrategy from './big-commerce-credit-customer-strategy';
import createBigCommerceCreditCustomerStrategy from './create-big-commerce-credit-customer-strategy';

describe('createPayPalCommerceCreditCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce button strategy', () => {
        const strategy = createBigCommerceCreditCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommerceCreditCustomerStrategy);
    });
});
