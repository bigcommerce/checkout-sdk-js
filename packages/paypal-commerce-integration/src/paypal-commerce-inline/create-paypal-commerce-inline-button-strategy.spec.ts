import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommerceInlineButtonStrategy from './create-paypal-commerce-inline-button-strategy';
import PayPalCommerceInlineButtonStrategy from './paypal-commerce-inline-button-strategy';

describe('createPayPalCommerceCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce inline button strategy', () => {
        const strategy = createPayPalCommerceInlineButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceInlineButtonStrategy);
    });
});
