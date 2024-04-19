import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommerceCreditButtonStrategy from './create-paypal-commerce-credit-button-strategy';
import PayPalCommerceCreditButtonStrategy from './paypal-commerce-credit-button-strategy';

describe('createPayPalCommerceCreditButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce button strategy', () => {
        const strategy = createPayPalCommerceCreditButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceCreditButtonStrategy);
    });
});
