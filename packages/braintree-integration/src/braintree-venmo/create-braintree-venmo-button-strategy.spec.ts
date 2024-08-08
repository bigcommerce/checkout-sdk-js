import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {PaymentIntegrationServiceMock} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';
import createBraintreeVenmoButtonStrategy from './create-braintree-venmo-button-strategy';
import BraintreeVenmoButtonStrategy from './braintree-venmo-button-strategy';

describe('createBraintreeVenmoButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });
   it('initializes braintree venmo button strategy', () => {
        const strategy = createBraintreeVenmoButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreeVenmoButtonStrategy);
   });
});
