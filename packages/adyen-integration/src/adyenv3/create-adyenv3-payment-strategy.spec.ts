import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import AdyenV3PaymentStrategy from './adyenv3-payment-strategy';
import createAdyenV3PaymentStrategy from './create-adyenv3-payment-strategy';

describe('createAdyenV3PaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates adyenv3 payment strategy', () => {
        const strategy = createAdyenV3PaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(AdyenV3PaymentStrategy);
    });
});
