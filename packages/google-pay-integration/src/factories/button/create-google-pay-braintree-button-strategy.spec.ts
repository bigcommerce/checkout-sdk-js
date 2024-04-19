import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayButtonStrategy from '../../google-pay-button-strategy';

import createGooglePayBraintreeButtonStrategy from './create-google-pay-braintree-button-strategy';

describe('createGooglePayBraintreeButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay braintree button strategy', () => {
        const strategy = createGooglePayBraintreeButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayButtonStrategy);
    });
});
