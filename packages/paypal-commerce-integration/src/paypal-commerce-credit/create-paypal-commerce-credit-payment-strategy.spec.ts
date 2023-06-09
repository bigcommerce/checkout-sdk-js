import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommerceCreditPaymentStrategy from './create-paypal-commerce-credit-payment-strategy';
import PayPalCommerceCreditPaymentStrategy from './paypal-commerce-credit-payment-strategy';

describe('createPayPalCommerceCreditPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce credit payment strategy', () => {
        const strategy = createPayPalCommerceCreditPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceCreditPaymentStrategy);
    });
});
