import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayCustomerStrategy from '../../google-pay-customer-strategy';

import createGooglePayWorldpayAccessCustomerStrategy from './create-google-pay-worldpayaccess-customer-strategy';

describe('createGooglePayWorldpayAccessCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay worldpayaccess customer strategy', () => {
        const storeConfigMock = getConfig().storeConfig;

        storeConfigMock.checkoutSettings.features = {
            'INT-5659.worldpayaccess_use_new_googlepay_customer_strategy': true,
        };
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValueOnce(
            storeConfigMock,
        );

        const strategy = createGooglePayWorldpayAccessCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayCustomerStrategy);
    });
});
