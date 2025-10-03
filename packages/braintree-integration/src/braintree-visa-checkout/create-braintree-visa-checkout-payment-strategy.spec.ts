import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeVisaCheckoutPaymentStrategy from './braintree-visa-checkout-payment-strategy';
import createBraintreeVisaCheckoutPaymentStrategy from './create-braintree-visa-checkout-payment-strategy';

describe('createBraintreeVisaCheckoutPaymentStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates braintree visa checkout payment strategy', () => {
        const strategy = createBraintreeVisaCheckoutPaymentStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreeVisaCheckoutPaymentStrategy);
    });
});
