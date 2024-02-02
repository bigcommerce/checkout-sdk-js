import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import AffirmPaymentStrategy from './affirm-payment-strategy';
import createAffirmPaymentStrategy from './create-affirm-payment-strategy';

describe('createAffirmPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates affirm payment strategy', () => {
        const strategy = createAffirmPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(AffirmPaymentStrategy);
    });
});
