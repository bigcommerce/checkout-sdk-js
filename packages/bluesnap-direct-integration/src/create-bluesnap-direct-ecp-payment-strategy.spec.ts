import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BlueSnapDirectEcpPaymentStrategy from './bluesnap-direct-ecp-payment-strategy';
import createBlueSnapDirectEcpPaymentStrategy from './create-bluesnap-direct-ecp-payment-strategy';

describe('createBlueSnapDirectEcpPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bluesnapdirect ecp payment strategy', () => {
        const strategy = createBlueSnapDirectEcpPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BlueSnapDirectEcpPaymentStrategy);
    });
});
