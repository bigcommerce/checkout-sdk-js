import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayPaymentStrategy from '../google-pay-payment-strategy';

import createGooglePayPayPalCommercePaymentStrategy from './create-google-pay-paypal-commerce-payment-strategy';

describe('createGooglePayPayPalCommercePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay paypal commerce payment strategy', () => {
        const strategy = createGooglePayPayPalCommercePaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });
});
