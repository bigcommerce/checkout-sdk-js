import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createDigitalriverPaymentStrategy from './create-digitalriver-payment-strategy';
import DigitalRiverPaymentStrategy from './digitalriver-payment-strategy';

describe('createDigitalRiverPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates digitalriver payment strategy', () => {
        const strategy = createDigitalriverPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(DigitalRiverPaymentStrategy);
    });
});
