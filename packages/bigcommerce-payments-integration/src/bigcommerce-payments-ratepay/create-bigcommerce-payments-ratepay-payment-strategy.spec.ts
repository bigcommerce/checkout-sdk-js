import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsRatePayPaymentStrategy from './bigcommerce-payments-ratepay-payment-strategy';
import createBigCommercePaymentsRatePayPaymentStrategy from './create-bigcommerce-payments-ratepay-payment-strategy';

describe('createBigCommercePaymentsRatePayPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce payments ratepay payment strategy', () => {
        const strategy = createBigCommercePaymentsRatePayPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsRatePayPaymentStrategy);
    });
});
