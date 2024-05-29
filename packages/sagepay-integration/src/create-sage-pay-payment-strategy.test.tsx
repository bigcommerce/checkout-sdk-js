import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createSagePayPaymentStrategy from './create-sage-pay-payment-strategy';
import SagePayPaymentStrategy from './sage-pay-payment-strategy';

describe('createSagePayPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates sagepay payment strategy', () => {
        const strategy = createSagePayPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(SagePayPaymentStrategy);
    });
});
