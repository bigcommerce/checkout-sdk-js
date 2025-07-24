import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import BraintreeSdk from './braintree-sdk';
import createBraintreeSdk from './create-braintree-sdk';

describe('createBraintreeSdk', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    it('instantiates braintree sdk', () => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        expect(createBraintreeSdk(paymentIntegrationService)).toBeInstanceOf(BraintreeSdk);
    });
});
