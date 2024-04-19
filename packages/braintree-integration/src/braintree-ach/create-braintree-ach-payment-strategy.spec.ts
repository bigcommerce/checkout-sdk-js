import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeAchPaymentStrategy from './braintree-ach-payment-strategy';
import createBraintreeAchPaymentStrategy from './create-braintree-ach-payment-strategy';

describe('createBraintreeAchPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates braintree ach payment strategy', () => {
        const strategy = createBraintreeAchPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreeAchPaymentStrategy);
    });
});
