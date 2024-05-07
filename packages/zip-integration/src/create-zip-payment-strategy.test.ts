import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import createZipPaymentStrategy from './create-zip-payment-strategy';
import ZipPaymentStrategy from './zip-payment-strategy';

describe('createZipPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates Zip payment strategy', () => {
        const strategy = createZipPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(ZipPaymentStrategy);
    });
});
