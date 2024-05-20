import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { createPayPalProPaymentStrategy, PaypalProPaymentStrategy } from './index';

describe('createPayPalProPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal pro payment strategy', () => {
        const strategy = createPayPalProPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PaypalProPaymentStrategy);
    });
});
