import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceRatepayPaymentStrategy from './big-commerce-ratepay-payment-strategy';
import createBigCommerceRatepayPaymentStrategy from './create-big-commerce-ratepay-payment-strategy';

describe('createPayPalCommerceRatePayPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce ratepay payment strategy', () => {
        const strategy = createBigCommerceRatepayPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommerceRatepayPaymentStrategy);
    });
});
