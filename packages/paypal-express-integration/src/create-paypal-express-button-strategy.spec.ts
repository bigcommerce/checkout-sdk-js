import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { createPaypalExpressButtonStrategy, PaypalExpressButtonStrategy } from './index';

describe('createPaypalExpressButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal express button strategy', () => {
        const strategy = createPaypalExpressButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PaypalExpressButtonStrategy);
    });
});
