import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayButtonStrategy from '../google-pay-button-strategy';

import createGooglePayBigCommercePaymentsButtonStrategy from './create-google-pay-bigcommerce-payments-button-strategy';

describe('createGooglePayBigCommercePaymentsButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay BigCommercePayments button strategy', () => {
        const strategy =
            createGooglePayBigCommercePaymentsButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayButtonStrategy);
    });
});
