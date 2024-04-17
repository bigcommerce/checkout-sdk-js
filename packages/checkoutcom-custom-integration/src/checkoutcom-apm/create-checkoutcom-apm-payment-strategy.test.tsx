import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { CheckoutComAPMPaymentStrategy, createCheckoutComAPMPaymentStrategy } from '..';

describe('createCheckoutComAPMPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates checkoutcom APM payment strategy', () => {
        const strategy = createCheckoutComAPMPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(CheckoutComAPMPaymentStrategy);
    });
});
