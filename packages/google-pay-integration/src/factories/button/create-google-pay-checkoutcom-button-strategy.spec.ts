import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayButtonStrategy from '../../google-pay-button-strategy';

import createGooglePayCheckoutComButtonStrategy from './create-google-pay-checkoutcom-button-strategy';

describe('createGooglePayCheckoutComButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay checkoutcom button strategy', () => {
        const strategy = createGooglePayCheckoutComButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayButtonStrategy);
    });
});
