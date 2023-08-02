import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommerceAlternativeMethodRatePayPaymentStrategy from './create-paypal-commerce-ratepay-payment-strategy';
import PaypalCommerceRatepayPaymentStrategy from './paypal-commerce-ratepay-payment-strategy';

describe('createPayPalCommerceAlternativeMethodRatePayPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce ratepay payment strategy', () => {
        const strategy =
            createPayPalCommerceAlternativeMethodRatePayPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PaypalCommerceRatepayPaymentStrategy);
    });
});
