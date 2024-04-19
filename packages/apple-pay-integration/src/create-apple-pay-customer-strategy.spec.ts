import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import ApplePayCustomerStrategy from './apple-pay-customer-strategy';
import createApplePayCustomerStrategy from './create-apple-pay-customer-strategy';

describe('createApplePayCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates apple-pay customer wallet button strategy', () => {
        const strategy = createApplePayCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(ApplePayCustomerStrategy);
    });
});
