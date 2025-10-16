import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { createPaypalExpressPaymentStrategy, PaypalExpressPaymentStrategy } from './index';

describe('createPaypalExpressPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal express payment strategy', () => {
        const strategy = createPaypalExpressPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PaypalExpressPaymentStrategy);
    });
});
