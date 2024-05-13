import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayButtonStrategy from '../../google-pay-button-strategy';

import createGooglePayCybersourceButtonStrategy from './create-google-pay-cybersource-button-strategy';

describe('createGooglePayCybersourceButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay cybersource button strategy', () => {
        const strategy = createGooglePayCybersourceButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayButtonStrategy);
    });
});
