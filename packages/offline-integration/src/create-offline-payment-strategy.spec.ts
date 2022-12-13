import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createOfflinePaymentStrategy from './create-offline-payment-strategy';
import OfflinePaymentStrategy from './offline-payment-strategy';

describe('createOfflinePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService =
            new PaymentIntegrationServiceMock() as PaymentIntegrationService;
    });

    it('instantiates offline payment strategy', () => {
        const strategy = createOfflinePaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(OfflinePaymentStrategy);
    });
});
