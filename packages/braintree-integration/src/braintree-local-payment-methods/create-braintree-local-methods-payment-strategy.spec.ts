import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeLocalMethodsPaymentStrategy from './braintree-local-methods-payment-strategy';
import createBraintreeLocalMethodsPaymentStrategy from './create-braintree-local-methods-payment-strategy';

describe('createBraintreePaypalCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates braintree local methods payment strategy', () => {
        const strategy = createBraintreeLocalMethodsPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreeLocalMethodsPaymentStrategy);
    });
});
