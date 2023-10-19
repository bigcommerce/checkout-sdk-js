import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayCustomerStrategy from '../google-pay-customer-strategy';

import createGooglePayPayPalCommerceCustomerStrategy from './create-google-pay-paypal-commerce-customer-strategy';

describe('createGooglePayPayPalCommerceCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay paypal commerce customer strategy', () => {
        const strategy = createGooglePayPayPalCommerceCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayCustomerStrategy);
    });
});
