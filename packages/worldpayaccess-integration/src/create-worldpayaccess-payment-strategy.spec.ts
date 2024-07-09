import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createWorldpayAccessPaymentStrategy from './create-worldpayaccess-payment-strategy';
import WorldpayAccessPaymetStrategy from './worldpayaccess-payment-strategy';

describe('createWorldpayAccessPaymetStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates Worldpay Access payment strategy', () => {
        const strategy = createWorldpayAccessPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(WorldpayAccessPaymetStrategy);
    });
});
