import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PaymentIntegrationServiceMock } from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { BRAINTREE_SDK_STABLE_VERSION } from './braintree-sdk-verison';
import BraintreeSDKVersionManager from './braintree-sdk-version-manager';

describe('BraintreeSDKVersionManager', () => {
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();
        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
    });

    it('instantiates braintree sdk version manager', () => {
        expect(braintreeSDKVersionManager).toBeInstanceOf(BraintreeSDKVersionManager);
    });

    it('get default braintree sdk version', () => {
        expect(braintreeSDKVersionManager.getSDKVersion()).toBe(BRAINTREE_SDK_STABLE_VERSION);
    });
});
