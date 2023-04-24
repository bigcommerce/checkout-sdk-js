import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommercePaymentStrategy from './create-paypal-commerce-payment-strategy';
import PayPalCommercePaymentStrategy from './paypal-commerce-payment-strategy';

describe('createPayPalCommercePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce payment strategy', () => {
        const strategy = createPayPalCommercePaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommercePaymentStrategy);
    });
});
