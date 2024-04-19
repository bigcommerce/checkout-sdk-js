import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeFastlaneCustomerStrategy from './braintree-fastlane-customer-strategy';
import createBraintreeFastlaneCustomerStrategy from './create-braintree-fastlane-customer-strategy';

describe('createBraintreeFastlaneCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates braintree fastlane checkout customer strategy', () => {
        const strategy = createBraintreeFastlaneCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreeFastlaneCustomerStrategy);
    });
});
