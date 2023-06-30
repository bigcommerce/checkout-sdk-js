import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createPayPalCommerceAlternativeMethodRatePayPaymentStrategy from './create-paypal-commerce-alternative-method-ratepay-payment-strategy';
import PayPalCommerceAlternativeMethodRatePayPaymentStrategy from './paypal-commerce-alternative-method-ratepay-payment-strategy';

describe('createPayPalCommerceAlternativeMethodRatePayPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = <PaymentIntegrationService>new PaymentIntegrationServiceMock();
    });

    it('instantiates paypal commerce ratepay payment strategy', () => {
        const strategy =
            createPayPalCommerceAlternativeMethodRatePayPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(PayPalCommerceAlternativeMethodRatePayPaymentStrategy);
    });
});
