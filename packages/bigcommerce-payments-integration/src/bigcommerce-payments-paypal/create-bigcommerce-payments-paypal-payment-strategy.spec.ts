import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsPayPalPaymentStrategy from './bigcommerce-payments-paypal-payment-strategy';
import createBigCommercePaymentsPayPalPaymentStrategy from './create-bigcommerce-payments-paypal-payment-strategy';

describe('createBigCommercePaymentsPayPalPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePaymentsPayPal payment strategy', () => {
        const strategy = createBigCommercePaymentsPayPalPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsPayPalPaymentStrategy);
    });
});
