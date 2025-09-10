import {
    PaymentIntegrationService,
    StoreConfig,
} from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import { BraintreeHostWindow } from './braintree';
import {
    BRAINTREE_SDK_DEFAULT_VERSION,
    BRAINTREE_SDK_HOSTED_FIELDS_FIX_VERSION,
    BRAINTREE_SDK_STABLE_VERSION,
} from './braintree-sdk-verison';
import BraintreeSDKVersionManager from './braintree-sdk-version-manager';

describe('BraintreeSDKVersionManager', () => {
    let braintreeSDKVersionManager: BraintreeSDKVersionManager;
    let paymentIntegrationService: PaymentIntegrationService;
    let storeConfigMock: StoreConfig | undefined;
    const braintreeWindow: BraintreeHostWindow = window;

    beforeEach(() => {
        storeConfigMock = getConfig().storeConfig;
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        storeConfigMock.checkoutSettings.features = {
            'PAYPAL-5636.update_braintree_sdk_version': false,
            'PAYPAL-5809.braintree_hosted_fields_fix_version': false,
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue(
            storeConfigMock,
        );

        braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
    });

    afterEach(() => {
        braintreeWindow.braintree = undefined;
    });

    it('instantiates braintree sdk version manager', () => {
        expect(braintreeSDKVersionManager).toBeInstanceOf(BraintreeSDKVersionManager);
    });

    it('get stable braintree sdk version', () => {
        expect(braintreeSDKVersionManager.getSDKVersion()).toBe(BRAINTREE_SDK_STABLE_VERSION);
    });

    it('get hosted fields fixed braintree sdk version if store config is not defined', () => {
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue(
            storeConfigMock,
        );

        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValueOnce(
            undefined,
        );

        expect(braintreeSDKVersionManager.getSDKVersion()).toBe(
            BRAINTREE_SDK_HOSTED_FIELDS_FIX_VERSION,
        );
    });

    it('get default braintree sdk version', () => {
        storeConfigMock = getConfig().storeConfig;
        storeConfigMock.checkoutSettings.features = {
            'PAYPAL-5636.update_braintree_sdk_version': true,
            'PAYPAL-5809.braintree_hosted_fields_fix_version': false,
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue(
            storeConfigMock,
        );

        expect(braintreeSDKVersionManager.getSDKVersion()).toBe(BRAINTREE_SDK_DEFAULT_VERSION);
    });

    it('get braintree sdk version with fixed hosted fields focus', () => {
        storeConfigMock = getConfig().storeConfig;
        storeConfigMock.checkoutSettings.features = {
            'PAYPAL-5809.braintree_hosted_fields_fix_version': true,
            'PAYPAL-5636.update_braintree_sdk_version': false,
        };

        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue(
            storeConfigMock,
        );

        expect(braintreeSDKVersionManager.getSDKVersion()).toBe(
            BRAINTREE_SDK_HOSTED_FIELDS_FIX_VERSION,
        );
    });

    it('should get unmanageable version if exist in window.braintree', () => {
        Object.defineProperty(braintreeWindow, 'braintree', {
            value: {
                client: {
                    VERSION: '1.123.4',
                },
            },
        });

        expect(braintreeSDKVersionManager.getSDKVersion()).toBe('1.123.4');
    });
});
