import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import ApplePayPaymentStrategy from './apple-pay-payment-strategy';
import createApplePayPaymentStrategy from './create-apple-pay-payment-strategy';

describe('createApplePayPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates apple-pay payment strategy', () => {
        const strategy = createApplePayPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(ApplePayPaymentStrategy);
    });
});
