import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceFastlanePaymentStrategy from './big-commerce-fastlane-payment-strategy';
import createBigCommerceFastlanePaymentStrategy from './create-big-commerce-fastlane-payment-strategy';

describe('createBigCommerceAcceleratedCheckoutPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce accelerated checkout payment strategy', () => {
        const strategy = createBigCommerceFastlanePaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommerceFastlanePaymentStrategy);
    });
});
