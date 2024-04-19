import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createTDOnlineMartPaymentStrategy from './create-td-online-mart-payment-strategy';
import TDOnlineMartPaymentStrategy from './td-online-mart-payment-strategy';

describe('createTDOnlineMartPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates TDOnlineMart payment strategy', () => {
        const strategy = createTDOnlineMartPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(TDOnlineMartPaymentStrategy);
    });
});
