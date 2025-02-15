import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreePaypalCreditButtonStrategy from './braintree-paypal-button-strategy';
import createBraintreePaypalCreditButtonStrategy from './create-braintree-paypal-button-strategy';

describe('createBraintreePaypalCreditButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates braintree paypal credit button strategy', () => {
        const strategy = createBraintreePaypalCreditButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreePaypalCreditButtonStrategy);
    });
});
