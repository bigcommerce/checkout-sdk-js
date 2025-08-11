import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createBraintreeCreditCardPaymentStrategy from './create-braintree-credit-card-payment-strategy';
import BraintreeCreditCardPaymentStrategy from './braintree-credit-card-payment-strategy';

describe('createBraintreeCreditCardPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates braintree credit card payment strategy', () => {
        const strategy = createBraintreeCreditCardPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreeCreditCardPaymentStrategy);
    });
});
