import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createCreditCardPaymentStrategy from './create-credit-card-payment-strategy';
import CreditCardPaymentStrategy from './credit-card-payment-strategy';

describe('createExternalPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates external payment strategy', () => {
        const strategy = createCreditCardPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(CreditCardPaymentStrategy);
    });
});
