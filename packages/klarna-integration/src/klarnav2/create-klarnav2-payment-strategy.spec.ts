import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createKlarnaV2PaymentStrategy from './create-klarnav2-payment-strategy';
import KlarnaV2PaymentStrategy from './klarnav2-payment-strategy';

describe('createKlarnaV2PaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates klarnav2 payment strategy', () => {
        const strategy = createKlarnaV2PaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(KlarnaV2PaymentStrategy);
    });
});
