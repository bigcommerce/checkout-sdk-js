import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createBraintreeVenmoPaymentStrategy from './create-braintree-venmo-payment-strategy';
import BraintreeVenmoPaymentStrategy from './braintree-venmo-payment-strategy';

describe('createBraintreeVenmoPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('initializes braintree venmo payment strategy', () => {
        const strategy = createBraintreeVenmoPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreeVenmoPaymentStrategy);
    });
});
