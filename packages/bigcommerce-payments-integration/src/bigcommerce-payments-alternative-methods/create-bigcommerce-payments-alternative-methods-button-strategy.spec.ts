import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsAlternativeMethodsButtonStrategy from './bigcommerce-payments-alternative-methods-button-strategy';
import createBigCommercePaymentsAlternativeMethodsButtonStrategy from './create-bigcommerce-payments-alternative-methods-button-strategy';

describe('createBigCommercePaymentsAlternativeMethodsButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments alternative methods button strategy', () => {
        const strategy =
            createBigCommercePaymentsAlternativeMethodsButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsAlternativeMethodsButtonStrategy);
    });
});
