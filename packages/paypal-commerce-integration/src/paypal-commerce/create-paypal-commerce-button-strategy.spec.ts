import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPaypalCommerceButtonStrategy from './create-paypal-commerce-button-strategy';
import PayPalCommerceButtonStrategy from './paypal-commerce-button-strategy';

describe('createPayPalCommerceButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce button strategy', () => {
        const strategy = createPaypalCommerceButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceButtonStrategy);
    });
});
