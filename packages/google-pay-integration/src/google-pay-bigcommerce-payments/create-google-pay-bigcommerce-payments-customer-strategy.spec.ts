import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayCustomerStrategy from '../google-pay-customer-strategy';

import createGooglePayBigCommercePaymentsCustomerStrategy from './create-google-pay-bigcommerce-payments-customer-strategy';

describe('createGooglePayBigCommercePaymentsCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay BigCommercePayments customer strategy', () => {
        const strategy =
            createGooglePayBigCommercePaymentsCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayCustomerStrategy);
    });
});
