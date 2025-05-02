import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceFastlaneCustomerStrategy from './big-commerce-fastlane-customer-strategy';
import createBigCommerceFastlaneCustomerStrategy from './create-big-commerce-fastlane-customer-strategy';

describe('createBigCommerceFastlaneCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce fastlane customer strategy', () => {
        const strategy = createBigCommerceFastlaneCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommerceFastlaneCustomerStrategy);
    });
});
