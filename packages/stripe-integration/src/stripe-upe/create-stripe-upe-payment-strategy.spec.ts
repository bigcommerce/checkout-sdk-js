import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createStripeUPEPaymentStrategy from './create-stripe-upe-payment-strategy';
import StripeUPEPaymentStrategy from './stripe-upe-payment-strategy';

describe('createStripeUPEPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('create stripe upe payment strategy', () => {
        const strategy = createStripeUPEPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(StripeUPEPaymentStrategy);
    });
});
