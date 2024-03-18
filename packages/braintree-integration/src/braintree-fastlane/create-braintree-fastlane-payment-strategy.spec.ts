import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeFastlanePaymentStrategy from './braintree-fastlane-payment-strategy';
import createBraintreeFastlanePaymentStrategy from './create-braintree-fastlane-payment-strategy';

describe('createBraintreeFastlanePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates braintree fastlane payment strategy', () => {
        const strategy = createBraintreeFastlanePaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreeFastlanePaymentStrategy);
    });
});
