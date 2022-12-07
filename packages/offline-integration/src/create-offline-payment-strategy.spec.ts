import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createExternalPaymentStrategy from './create-offline-payment-strategy';
import OfflinePaymentStrategy from './offline-payment-strategy';

describe('createExternalPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService =
            new PaymentIntegrationServiceMock() as PaymentIntegrationService;
    });

    it('instantiates external payment strategy', () => {
        const strategy = createExternalPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(OfflinePaymentStrategy);
    });
});
