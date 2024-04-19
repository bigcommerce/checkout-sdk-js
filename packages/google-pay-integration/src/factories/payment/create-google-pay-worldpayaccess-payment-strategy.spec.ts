import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayPaymentStrategy from '../../google-pay-payment-strategy';

import createGooglePayWorldpayAccessPaymentStrategy from './create-google-pay-worldpayaccess-payment-strategy';

describe('createGooglePayWorldpayAccessPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay worldpayaccess payment strategy', () => {
        const strategy = createGooglePayWorldpayAccessPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });
});
