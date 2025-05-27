import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsFastlaneCustomerStrategy from './bigcommerce-payments-fastlane-customer-strategy';
import createBigCommercePaymentsFastlaneCustomerStrategy from './create-bigcommerce-payments-fastlane-customer-strategy';

describe('createBigCommercePaymentsFastlaneCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments fastlane customer strategy', () => {
        const strategy =
            createBigCommercePaymentsFastlaneCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsFastlaneCustomerStrategy);
    });
});
