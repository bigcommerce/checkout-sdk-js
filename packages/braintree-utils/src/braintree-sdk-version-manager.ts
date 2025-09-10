import { find } from 'lodash';

import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { isExperimentEnabled } from '@bigcommerce/checkout-sdk/utility';

import { BraintreeHostWindow } from './braintree';
import {
    BRAINTREE_SDK_DEFAULT_VERSION,
    BRAINTREE_SDK_HOSTED_FIELDS_FIX_VERSION,
    BRAINTREE_SDK_STABLE_VERSION,
} from './braintree-sdk-verison';

export default class BraintreeSDKVersionManager {
    private braintreeWindow: BraintreeHostWindow = window;

    constructor(private paymentIntegrationService: PaymentIntegrationService) {}

    getSDKVersion() {
        const state = this.paymentIntegrationService.getState();
        const storeConfig = state.getStoreConfig();
        const features = storeConfig?.checkoutSettings.features || {};

        const preloadedVersion = this.getPreloadedSDKVersion();

        if (preloadedVersion) {
            return preloadedVersion;
        }

        if (isExperimentEnabled(features, 'PAYPAL-5809.braintree_hosted_fields_fix_version')) {
            return BRAINTREE_SDK_HOSTED_FIELDS_FIX_VERSION;
        }

        if (isExperimentEnabled(features, 'PAYPAL-5636.update_braintree_sdk_version')) {
            return BRAINTREE_SDK_DEFAULT_VERSION;
        }

        return BRAINTREE_SDK_STABLE_VERSION;
    }

    private getPreloadedSDKVersion(): void | string {
        const braintree = this.braintreeWindow.braintree;

        if (braintree) {
            const preloadedVersion = find<{ VERSION?: string }>(
                Object.values(braintree),
                (module) => !!module.VERSION,
            );

            return preloadedVersion?.VERSION;
        }
    }
}
