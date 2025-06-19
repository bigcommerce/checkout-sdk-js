import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigcommercePaymentsButtonStrategy from './bigcommerce-payments-button-strategy';
import createBigCommercePaymentsButtonStrategy from './create-bigcommerce-payments-button-strategy';

describe('createBigCommercePaymentsButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePaymentsButtonStrategy', () => {
        const strategy = createBigCommercePaymentsButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigcommercePaymentsButtonStrategy);
    });
});
