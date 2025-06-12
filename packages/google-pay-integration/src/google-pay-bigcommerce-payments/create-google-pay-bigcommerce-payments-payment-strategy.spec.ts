import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayPaymentStrategy from '../google-pay-payment-strategy';

import createGooglePayBigCommercePaymentsPaymentStrategy from './create-google-pay-bigcommerce-payments-payment-strategy';

describe('createGooglePayBigCommercePaymentsPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay BigCommercePayments strategy', () => {
        const strategy =
            createGooglePayBigCommercePaymentsPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });
});
