import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommerceFastlaneCustomerStrategy from './create-paypal-commerce-fastlane-customer-strategy';
import PayPalCommerceFastlaneCustomerStrategy from './paypal-commerce-fastlane-customer-strategy';

describe('createPayPalCommerceFastlaneCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce fastlane customer strategy', () => {
        const strategy = createPayPalCommerceFastlaneCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceFastlaneCustomerStrategy);
    });
});
