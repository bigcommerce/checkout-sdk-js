import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BigCommercePaymentsPayLaterButtonStrategy from './bigcommerce-payments-paylater-button-strategy';
import createBigCommercePaymentsPayLaterButtonStrategy from './create-bigcommerce-payments-paylater-button-strategy';

describe('createBigCommercePaymentsPayLaterButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates BigCommercePayments Paylater button strategy', () => {
        const strategy = createBigCommercePaymentsPayLaterButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BigCommercePaymentsPayLaterButtonStrategy);
    });
});
