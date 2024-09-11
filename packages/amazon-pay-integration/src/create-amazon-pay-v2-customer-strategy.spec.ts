import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import AmazonPayV2CustomerStrategy from './amazon-pay-v2-customer-strategy';
import createAmazonPayV2CustomerStrategy from './create-amazon-pay-v2-customer-strategy';

describe('createAmazonPayV2PaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates AmazonPayV2 payment strategy', () => {
        const strategy = createAmazonPayV2CustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(AmazonPayV2CustomerStrategy);
    });
});
