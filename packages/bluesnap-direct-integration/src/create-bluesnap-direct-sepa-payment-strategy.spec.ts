import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BlueSnapDirectSepaPaymentStrategy from './bluesnap-direct-sepa-payment-strategy';
import createBlueSnapDirectSepaPaymentStrategy from './create-bluesnap-direct-sepa-payment-strategy';

describe('createBlueSnapDirectSepaPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('initializes bluesnapdirect Sepa payment strategy', () => {
        const strategy = createBlueSnapDirectSepaPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BlueSnapDirectSepaPaymentStrategy);
    });
});
