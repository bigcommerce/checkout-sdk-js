import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsAlternativeMethodsPaymentStrategy from './bigcommerce-payments-alternative-methods-payment-strategy';
import createBigCommercePaymentsAlternativeMethodsPaymentStrategy from './create-bigcommerce-payments-alternative-methods-payment-strategy';

describe('createBigCommercePaymentsAlternativeMethodsPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments alternative methods payment strategy', () => {
        const strategy =
            createBigCommercePaymentsAlternativeMethodsPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsAlternativeMethodsPaymentStrategy);
    });
});
