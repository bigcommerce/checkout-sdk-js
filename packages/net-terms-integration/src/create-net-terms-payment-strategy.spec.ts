import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import NetTermsPaymentStrategy from './net-terms-payment-strategy';

import { createNetTermsPaymentStrategy } from './';

describe('createNetTermsPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates net terms payment strategy', () => {
        const strategy = createNetTermsPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(NetTermsPaymentStrategy);
    });
});
