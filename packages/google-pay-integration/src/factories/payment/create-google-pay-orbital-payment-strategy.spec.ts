import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayPaymentStrategy from '../../google-pay-payment-strategy';

import createGooglePayOrbitalPaymentStrategy from './create-google-pay-orbital-payment-strategy';

describe('createGooglePayOrbitalPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay orbital payment strategy', () => {
        const strategy = createGooglePayOrbitalPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });
});
