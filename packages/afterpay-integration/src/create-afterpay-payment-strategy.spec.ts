import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import AfterpayPaymentStrategy from './afterpay-payment-strategy';
import createAfterpayPaymentStrategy from './create-afterpay-payment-strategy';

describe('createAfterpayPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates afterpay payment strategy', () => {
        const strategy = createAfterpayPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(AfterpayPaymentStrategy);
    });
});
