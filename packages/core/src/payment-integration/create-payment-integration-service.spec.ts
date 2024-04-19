import { createCheckoutStore } from '../checkout';

import createPaymentIntegrationService from './create-payment-integration-service';
import DefaultPaymentIntegrationService from './default-payment-integration-service';

describe('createPaymentIntegrationService', () => {
    it('creates instance of PaymentIntegrationService', () => {
        const instance = createPaymentIntegrationService(createCheckoutStore());

        expect(instance).toBeInstanceOf(DefaultPaymentIntegrationService);
    });
});
