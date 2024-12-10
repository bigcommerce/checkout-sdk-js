import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createMonerisPaymentStrategy from './create-moneris-payment-strategy';
import MonerisPaymentStrategy from './moneris-payment-strategy';

describe('createMonerisPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates Moneris payment strategy', () => {
        const strategy = createMonerisPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(MonerisPaymentStrategy);
    });
});
