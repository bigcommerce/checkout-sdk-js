import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayCustomerStrategy from '../../google-pay-customer-strategy';

import createGooglePayCheckoutComCustomerStrategy from './create-google-pay-checkoutcom-customer-strategy';

describe('createGooglePayCheckoutComCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay checkoutcom customer strategy', () => {
        const storeConfigMock = getConfig().storeConfig;

        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValueOnce(
            storeConfigMock,
        );

        const strategy = createGooglePayCheckoutComCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayCustomerStrategy);
    });
});
