import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsPayLaterPaymentStrategy from './bigcommerce-payments-paylater-payment-strategy';
import createBigCommercePaymentsPayLaterPaymentStrategy from './create-bigcommerce-payments-paylater-payment-strategy';

describe('createBigCommercePaymentsPayLaterPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments PayLater payment strategy', () => {
        const strategy =
            createBigCommercePaymentsPayLaterPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsPayLaterPaymentStrategy);
    });
});
