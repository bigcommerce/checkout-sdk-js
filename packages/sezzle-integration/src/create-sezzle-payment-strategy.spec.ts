import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createSezzlePaymentStrategy from './create-sezzle-payment-strategy';
import SezzlePaymentStrategy from './sezzle-payment-strategy';

describe('createSezzlePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates sezzle payment strategy', () => {
        const strategy = createSezzlePaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(SezzlePaymentStrategy);
    });
});
