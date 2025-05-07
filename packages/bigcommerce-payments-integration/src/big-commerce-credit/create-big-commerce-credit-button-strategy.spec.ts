import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceCreditButtonStrategy from './big-commerce-credit-button-strategy';
import createBigCommerceCreditButtonStrategy from './create-big-commerce-credit-button-strategy';

describe('createBigCommerceCreditButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce button strategy', () => {
        const strategy = createBigCommerceCreditButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommerceCreditButtonStrategy);
    });
});
