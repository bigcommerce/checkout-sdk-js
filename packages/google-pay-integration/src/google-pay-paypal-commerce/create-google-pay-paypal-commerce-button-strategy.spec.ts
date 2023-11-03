import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayButtonStrategy from '../google-pay-button-strategy';

import createGooglePayPaypalCommerceButtonStrategy from './create-google-pay-paypal-commerce-button-strategy';

describe('createGooglePayPaypalCommerceButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay paypalcommerce button strategy', () => {
        const strategy = createGooglePayPaypalCommerceButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayButtonStrategy);
    });
});
