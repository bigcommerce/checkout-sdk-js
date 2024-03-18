import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BlueSnapV2PaymentStrategy from './bluesnapv2-payment-strategy';
import createBluesnapv2PaymentStrategy from './create-bluesnapv2-payment-strategy';

describe('createBlueSnapV2PaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bluesnapv2 payment strategy', () => {
        const strategy = createBluesnapv2PaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BlueSnapV2PaymentStrategy);
    });
});
