import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createStripeUPECustomerStrategy from './create-stripe-upe-customer-strategy';
import StripeUPECustomerStrategy from './stripe-upe-customer-strategy';

describe('createStripeUPECustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('create stripe upe customer strategy', () => {
        const strategy = createStripeUPECustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(StripeUPECustomerStrategy);
    });
});
