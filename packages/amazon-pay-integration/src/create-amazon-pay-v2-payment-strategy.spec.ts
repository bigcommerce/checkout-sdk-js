import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import AmazonPayV2PaymentStrategy from './amazon-pay-v2-payment-strategy';
import createAmazonPayV2PaymentStrategy from './create-amazon-pay-v2-payment-strategy';

describe('createAmazonPayV2PaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates AmazonPayV2 payment strategy', () => {
        const strategy = createAmazonPayV2PaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(AmazonPayV2PaymentStrategy);
    });
});
