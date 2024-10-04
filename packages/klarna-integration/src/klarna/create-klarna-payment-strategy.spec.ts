import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createKlarnaPaymentStrategy from './create-klarna-payment-strategy';
import KlarnaPaymentStrategy from './klarna-payment-strategy';

describe('createKlarnaPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates klarna payment strategy', () => {
        const strategy = createKlarnaPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(KlarnaPaymentStrategy);
    });
});
