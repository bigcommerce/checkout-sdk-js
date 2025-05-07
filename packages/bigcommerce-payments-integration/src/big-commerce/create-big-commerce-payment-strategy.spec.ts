import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentStrategy from './big-commerce-payment-strategy';
import createBigCommercePaymentStrategy from './create-big-commerce-payment-strategy';

describe('createBigCommercePaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce commerce payment strategy', () => {
        const strategy = createBigCommercePaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentStrategy);
    });
});
