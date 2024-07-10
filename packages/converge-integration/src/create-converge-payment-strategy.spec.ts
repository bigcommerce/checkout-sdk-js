import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import ConvergePaymentStrategy from './converge-payment-strategy';
import createConvergePaymentStrategy from './create-converge-payment-strategy';

describe('createConvergePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates Converge payment strategy', () => {
        const strategy = createConvergePaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(ConvergePaymentStrategy);
    });
});
