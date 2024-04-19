import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayPaymentStrategy from '../../google-pay-payment-strategy';

import createGooglePayAuthorizeNetPaymentStrategy from './create-google-pay-authorizenet-payment-strategy';

describe('createGooglePayAuthorizeNetPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay authorizenet payment strategy', () => {
        const strategy = createGooglePayAuthorizeNetPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayPaymentStrategy);
    });
});
