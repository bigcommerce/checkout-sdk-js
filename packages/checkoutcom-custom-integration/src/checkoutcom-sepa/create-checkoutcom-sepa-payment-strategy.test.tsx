import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import CheckoutComSEPAPaymentStrategy from './checkoutcom-sepa-payment-strategy';
import createCheckoutcomSepaPaymentStrategy from './create-checkoutcom-sepa-payment-strategy';

describe('createCheckoutComSepaPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates checkoutcom sepa payment strategy', () => {
        const strategy = createCheckoutcomSepaPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(CheckoutComSEPAPaymentStrategy);
    });
});
