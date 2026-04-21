import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createWorldpayAccessOpenBankingPaymentStrategy from './create-worldpayaccess-open-banking-payment-strategy';
import WorldpayAccessOpenBankingPaymentStrategy from './worldpayaccess-open-banking-payment-strategy';

describe('createWorldpayAccessOpenBankingPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates Worldpay Access Open Banking payment strategy', () => {
        const strategy = createWorldpayAccessOpenBankingPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(WorldpayAccessOpenBankingPaymentStrategy);
    });
});
