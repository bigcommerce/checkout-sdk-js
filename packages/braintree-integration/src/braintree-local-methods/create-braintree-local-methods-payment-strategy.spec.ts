import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeLocalMethodsPaymentStrategy from './braintree-local-methods-payment-strategy';
import createBraintreeLocalMethodsPaymentStrategy from './create-braintree-local-methods-payment-strategy';

describe('createBraintreeLocalMethodsPaymentStrategy', () => {
    it('instantiates braintree local methods payment strategy', () => {
        const strategy = createBraintreeLocalMethodsPaymentStrategy(
            new PaymentIntegrationServiceMock(),
        );

        expect(strategy).toBeInstanceOf(BraintreeLocalMethodsPaymentStrategy);
    });
});
