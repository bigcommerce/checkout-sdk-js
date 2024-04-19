import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BlueSnapDirectAPMPaymentStrategy from './bluesnap-direct-apm-payment-strategy';
import createBlueSnapDirectApmPaymentStrategy from './create-bluesnap-direct-apm-payment-strategy';

describe('createBlueSnapDirectApmPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bluesnapdirect Apm payment strategy', () => {
        const strategy = createBlueSnapDirectApmPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BlueSnapDirectAPMPaymentStrategy);
    });
});
