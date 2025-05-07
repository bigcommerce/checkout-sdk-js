import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceCreditPaymentStrategy from './big-commerce-credit-payment-strategy';
import createBigCommerceCreditPaymentStrategy from './create-big-commerce-credit-payment-strategy';

describe('createBigCommerceCreditPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce credit payment strategy', () => {
        const strategy = createBigCommerceCreditPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommerceCreditPaymentStrategy);
    });
});
