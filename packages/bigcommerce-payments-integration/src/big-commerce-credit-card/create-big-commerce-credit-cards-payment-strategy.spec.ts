import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceCreditCardsPaymentStrategy from './big-commerce-credit-cards-payment-strategy';
import createBigCommerceCreditCardsPaymentStrategy from './create-big-commerce-credit-cards-payment-strategy';

describe('createBigCommerceCreditCardsPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce credit cards button strategy', () => {
        const strategy = createBigCommerceCreditCardsPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommerceCreditCardsPaymentStrategy);
    });
});
