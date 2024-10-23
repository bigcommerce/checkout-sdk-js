import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createStripeOCSPaymentStrategy from './create-stripe-ocs-payment-strategy';
import StripeOCSPaymentStrategy from './stripe-ocs-payment-strategy';

describe('createStripeOCSPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('create stripe ocs payment strategy', () => {
        const strategy = createStripeOCSPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(StripeOCSPaymentStrategy);
    });
});
