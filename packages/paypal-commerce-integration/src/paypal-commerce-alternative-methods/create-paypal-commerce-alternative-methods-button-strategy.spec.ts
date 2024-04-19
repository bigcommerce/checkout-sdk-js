import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommerceAlternativeMethodsButtonStrategy from './create-paypal-commerce-alternative-methods-button-strategy';
import PayPalCommerceAlternativeMethodsButtonStrategy from './paypal-commerce-alternative-methods-button-strategy';

describe('createPayPalCommerceAlternativeMethodsButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce alternative methods button strategy', () => {
        const strategy =
            createPayPalCommerceAlternativeMethodsButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceAlternativeMethodsButtonStrategy);
    });
});
