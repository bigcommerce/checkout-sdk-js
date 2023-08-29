import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayPaymentStrategy from '../../google-pay-payment-strategy';

import createGooglePayCybersourcePaymentStrategy from './create-google-pay-cybersource-payment-strategy';

describe('createGooglePayCybersourcePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay cybersource payment strategy', () => {
        const strategy = createGooglePayCybersourcePaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });
});
