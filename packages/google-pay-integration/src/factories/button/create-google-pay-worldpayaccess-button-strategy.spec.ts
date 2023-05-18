import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayButtonStrategy from '../../google-pay-button-strategy';

import createGooglePayWorldpayAccessButtonStrategy from './create-google-pay-worldpayaccess-button-strategy';

describe('createGooglePayWorldpayAccessButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay worldpayaccess button strategy', () => {
        const strategy = createGooglePayWorldpayAccessButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayButtonStrategy);
    });
});
