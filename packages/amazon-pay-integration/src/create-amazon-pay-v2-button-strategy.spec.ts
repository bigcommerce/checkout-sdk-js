import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import AmazonPayV2ButtonStrategy from './amazon-pay-v2-button-strategy';
import createAmazonPayV2ButtonStrategy from './create-amazon-pay-v2-button-strategy';

describe('createAmazonPayV2PaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates AmazonPayV2 payment strategy', () => {
        const strategy = createAmazonPayV2ButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(AmazonPayV2ButtonStrategy);
    });
});
