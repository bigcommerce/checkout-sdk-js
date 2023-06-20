import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createLegacyPaymentStrategy from './create-legacy-payment-strategy';
import LegacyPaymentStrategy from './legacy-payment-strategy';

describe('createExternalPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates external payment strategy', () => {
        const strategy = createLegacyPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(LegacyPaymentStrategy);
    });
});
