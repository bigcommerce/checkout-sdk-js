import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayCustomerStrategy from '../../google-pay-customer-strategy';

import createGooglePayAuthorizeDotNetCustomerStrategy from './create-google-pay-authorizenet-customer-strategy';

describe('createGooglePayAuthorizeDotNetCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay authorizenet customer strategy', () => {
        const storeConfigMock = getConfig().storeConfig;

        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValueOnce(
            storeConfigMock,
        );

        const strategy = createGooglePayAuthorizeDotNetCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayCustomerStrategy);
    });
});
