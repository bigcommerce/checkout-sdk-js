import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { CheckoutComFawryPaymentStrategy, createCheckoutComFawryPaymentStrategy } from '..';

describe('createCheckoutComFawryPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates checkoutcom fawry payment strategy', () => {
        const strategy = createCheckoutComFawryPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(CheckoutComFawryPaymentStrategy);
    });
});
