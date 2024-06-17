import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeVisaCheckoutButtonStrategy from './braintree-visa-checkout-button-strategy';
import createBraintreeVisaCheckoutButtonStrategy from './create-braintree-visa-checkout-button-strategy';

describe('createBraintreeVisaCheckoutButtonStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates braintree visa checkout button strategy', () => {
        const strategy = createBraintreeVisaCheckoutButtonStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(BraintreeVisaCheckoutButtonStrategy);
    });
});
