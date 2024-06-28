import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayPaymentStrategy from '../../google-pay-payment-strategy';

import createGooglePayTdOnlineMartPaymentStrategy from './create-google-pay-tdonlinemart-payment-strategy';

describe('createGooglePayTdOnlineMartPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay TD Online Mart payment strategy', () => {
        const strategy = createGooglePayTdOnlineMartPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });
});
