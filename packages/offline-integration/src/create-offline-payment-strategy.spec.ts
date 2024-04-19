import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import OfflinePaymentStrategy from './offline-payment-strategy';

import { createOfflinePaymentStrategy } from './';

describe('createOfflinePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates offline payment strategy', () => {
        const strategy = createOfflinePaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(OfflinePaymentStrategy);
    });
});
