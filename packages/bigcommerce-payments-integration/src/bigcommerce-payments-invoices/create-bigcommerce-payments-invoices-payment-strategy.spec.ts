import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsInvoicesPaymentStrategy from './bigcommerce-payments-invoices-payment-strategy';
import createBigCommercePaymentsInvoicesPaymentStrategy from './create-bigcommerce-payments-invoices-payment-strategy';

describe('createBigCommercePaymentsInvoicesPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments invoices payment strategy', () => {
        const strategy =
            createBigCommercePaymentsInvoicesPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsInvoicesPaymentStrategy);
    });
});
