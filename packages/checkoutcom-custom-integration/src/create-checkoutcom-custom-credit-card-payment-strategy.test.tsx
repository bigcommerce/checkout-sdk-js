import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import CheckoutComCreditCardPaymentStrategy from './checkoutcom-credit-card-payment-strategy';
import createCheckoutcomCreditCardPaymentStrategy from './create-checkoutcom-credit-card-payment-strategy';

describe('createCheckoutComCreditCardPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates checkoutcom custom payment strategy', () => {
        const strategy = createCheckoutcomCreditCardPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(CheckoutComCreditCardPaymentStrategy);
    });
});
