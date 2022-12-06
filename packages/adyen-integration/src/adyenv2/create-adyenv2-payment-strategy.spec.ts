import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import AdyenV2PaymentStrategy from './adyenv2-payment-strategy';
import createAdyenV2PaymentStrategy from './create-adyenv2-payment-strategy';

describe('createAdyenV2PaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates adyenv2 payment strategy', () => {
        const strategy = createAdyenV2PaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(AdyenV2PaymentStrategy);
    });
});
