import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommerceAlternativeMethodsPaymentStrategy from './create-paypal-commerce-alternative-methods-payment-strategy';
import PayPalCommerceAlternativeMethodsPaymentStrategy from './paypal-commerce-alternative-methods-payment-strategy';

describe('createPayPalCommerceAlternativeMethodsPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce alternative methods payment strategy', () => {
        const strategy =
            createPayPalCommerceAlternativeMethodsPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceAlternativeMethodsPaymentStrategy);
    });
});
