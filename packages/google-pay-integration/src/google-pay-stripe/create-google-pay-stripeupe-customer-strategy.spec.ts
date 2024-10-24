import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayCustomerStrategy from '../google-pay-customer-strategy';

import createGooglePayStripeUpeCustomerStrategy from './create-google-pay-stripeupe-customer-strategy';

describe('createGooglePayStripeUpeCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay stripe upe customer strategy', () => {
        const storeConfigMock = getConfig().storeConfig;

        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValueOnce(
            storeConfigMock,
        );

        const strategy = createGooglePayStripeUpeCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayCustomerStrategy);
    });
});
