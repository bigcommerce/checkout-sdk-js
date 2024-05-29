import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import GooglePayCustomerStrategy from '../../google-pay-customer-strategy';

import createGooglePayBnzCustomerStrategy from './create-google-pay-bnz-customer-strategy';

describe('createGooglePayBnzCustomerStrategy', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
    });

    it('instantiates google pay bnz customer strategy', () => {
        const storeConfigMock = getConfig().storeConfig;

        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValueOnce(
            storeConfigMock,
        );

        const strategy = createGooglePayBnzCustomerStrategy(paymentIntegrationService);

        expect(strategy).toBeInstanceOf(GooglePayCustomerStrategy);
    });
});
