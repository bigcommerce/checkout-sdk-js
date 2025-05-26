import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsCreditCardsPaymentStrategy from './bigcommerce-payments-credit-cards-payment-strategy';
import createBigCommercePaymentsCreditCardsPaymentStrategy from './create-bigcommerce-payments-credit-cards-payment-strategy';

describe('createBigCommercePaymentsCreditCardsPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce payments credit cards button strategy', () => {
        const strategy =
            createBigCommercePaymentsCreditCardsPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsCreditCardsPaymentStrategy);
    });
});
