import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayButtonStrategy from '../../google-pay-button-strategy';

import createGooglePayAuthorizeNetButtonStrategy from './create-google-pay-authorizenet-button-strategy';

describe('createGooglePayAuthorizeNetButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay authorizenet button strategy', () => {
        const strategy = createGooglePayAuthorizeNetButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayButtonStrategy);
    });
});
