import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsRedirectAlternativeMethodsPaymentStrategy from './bigcomemrce-payments-redirect-alternative-methods-payment-strategy';
import createBigCommercePaymentsRedirectAlternativeMethodsPaymentStrategy from './create-bigcommerce-payments-redirect-alternative-methods-payment-strategy';

describe('createBigCommercePaymentsRedirectAlternativeMethodsPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePaymentsRedirectAlternativeMethodsPaymentStrategy', () => {
        const strategy =
            createBigCommercePaymentsRedirectAlternativeMethodsPaymentStrategy(
                paymentIntegrationService,
            );

        expect(strategy).toBeInstanceOf(
            BigCommercePaymentsRedirectAlternativeMethodsPaymentStrategy,
        );
    });
});
