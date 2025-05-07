import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommerceAlternativeMethodsPaymentStrategy from './big-commerce-alternative-methods-payment-strategy';
import createBigCommerceAlternativeMethodsPaymentStrategy from './create-big-commerce-alternative-methods-payment-strategy';

describe('createBigCommerceAlternativeMethodsPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates bigcommerce commerce alternative methods payment strategy', () => {
        const strategy =
            createBigCommerceAlternativeMethodsPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommerceAlternativeMethodsPaymentStrategy);
    });
});
