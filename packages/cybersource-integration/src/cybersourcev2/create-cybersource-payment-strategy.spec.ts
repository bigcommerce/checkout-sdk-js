import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createCybersourcev2PaymentStrategy from './create-cybersourcev2-payment-strategy';
import CyberSourceV2PaymentStrategy from './cybersourcev2-payment-strategy';

describe('createCyberSourceV2PaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates CyberSource v2 payment strategy', () => {
        const strategy = createCybersourcev2PaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(CyberSourceV2PaymentStrategy);
    });
});
