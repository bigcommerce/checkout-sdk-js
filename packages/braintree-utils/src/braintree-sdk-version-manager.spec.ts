import {
    PaymentIntegrationService,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import {
    BRAINTREE_SDK_DEFAULT_VERSION,
    BRAINTREE_SDK_STABLE_VERSION,
} from './braintree-sdk-verison';
import BraintreeSDKVersionManager from './braintree-sdk-version-manager';

describe('BraintreeSDKVersionManager', () => {
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;
    let paymentIntegrationService: PaymentIntegrationService;
    let storeConfigMock: StoreConfig | undefined;

    beforeEach(() => {
        storeConfigMock = getConfig().storeConfig;
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        storeConfigMock.checkoutSettings.features = {
            'PAYPAL-5636.update_braintree_sdk_version': false,
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue(
            storeConfigMock,
        );

        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
    });

    it('instantiates braintree sdk version manager', () => {
        expect(braintreeSDKVersionManager).toBeInstanceOf(BraintreeSDKVersionManager);
    });

    it('get stable braintree sdk version', () => {
        expect(braintreeSDKVersionManager.getSDKVersion()).toBe(BRAINTREE_SDK_STABLE_VERSION);
    });

    it('get default braintree sdk version if store config is not defined', () => {
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValueOnce(
            undefined,
        );

        expect(braintreeSDKVersionManager.getSDKVersion()).toBe(BRAINTREE_SDK_DEFAULT_VERSION);
    });

    it('get default braintree sdk version', () => {
        storeConfigMock = getConfig().storeConfig;
        storeConfigMock.checkoutSettings.features = {
            'PAYPAL-5636.update_braintree_sdk_version': true,
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue(
            storeConfigMock,
        );

        expect(braintreeSDKVersionManager.getSDKVersion()).toBe(BRAINTREE_SDK_DEFAULT_VERSION);
    });
});
