import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { createCheckoutComIdealPaymentStrategy } from '..';

import CheckoutComiDealPaymentStrategy from './checkoutcom-ideal-payment-strategy';

describe('createCheckoutComiDealPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates checkoutcom iDeal payment strategy', () => {
        const strategy = createCheckoutComIdealPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(CheckoutComiDealPaymentStrategy);
    });
});
