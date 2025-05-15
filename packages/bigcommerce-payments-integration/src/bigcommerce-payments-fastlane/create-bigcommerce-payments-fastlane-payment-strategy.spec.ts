import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsFastlanePaymentStrategy from './bigcommerce-payments-fastlane-payment-strategy';
import createBigCommercePaymentsFastlanePaymentStrategy from './create-bigcommerce-payments-fastlane-payment-strategy';

describe('createBigCommercePaymentsAcceleratedCheckoutPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments accelerated checkout payment strategy', () => {
        const strategy =
            createBigCommercePaymentsFastlanePaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsFastlanePaymentStrategy);
    });
});
