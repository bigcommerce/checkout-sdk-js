import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import ApplePayButtonStrategy from './apple-pay-button-strategy';
import createApplePayButtonStrategy from './create-apple-pay-button-strategy';

describe('createApplePayButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates apple-pay checkout button strategy', () => {
        const strategy = createApplePayButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(ApplePayButtonStrategy);
    });
});
