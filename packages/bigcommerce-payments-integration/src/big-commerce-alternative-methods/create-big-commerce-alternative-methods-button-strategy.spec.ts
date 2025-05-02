import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceAlternativeMethodsButtonStrategy from './big-commerce-alternative-methods-button-strategy';
import createBigCommerceAlternativeMethodsButtonStrategy from './create-big-commerce-alternative-methods-button-strategy';

describe('createBigCommerceAlternativeMethodsButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce commerce alternative methods button strategy', () => {
        const strategy =
            createBigCommerceAlternativeMethodsButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommerceAlternativeMethodsButtonStrategy);
    });
});
