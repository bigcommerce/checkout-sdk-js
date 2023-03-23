import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommerceCreditCardsPaymentStrategy from './create-paypal-commerce-credit-cards-payment-strategy';
import PayPalCommerceCreditCardsPaymentStrategy from './paypal-commerce-credit-cards-payment-strategy';

describe('createPayPalCommerceCreditCardsPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce credit cards button strategy', () => {
        const strategy = createPayPalCommerceCreditCardsPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceCreditCardsPaymentStrategy);
    });
});
