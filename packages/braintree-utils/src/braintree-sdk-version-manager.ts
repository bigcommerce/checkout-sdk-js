import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { isExperimentEnabled } from '@bigcommerce/checkout-sdk/utility';

import {
    BRAINTREE_SDK_DEFAULT_VERSION,
    BRAINTREE_SDK_STABLE_VERSION,
} from './braintree-sdk-verison';

export default class BraintreeSDKVersionManager {
    constructor(private paymentIntegrationService: PaymentIntegrationService) {}

    getSDKVersion() {
        const state = this.paymentIntegrationService.getState();
        const features = state.getStoreConfigOrThrow().checkoutSettings.features;

        if (isExperimentEnabled(features, 'PAYPAL-5636.update_braintree_sdk_version')) {
            return BRAINTREE_SDK_DEFAULT_VERSION;
        }

        return BRAINTREE_SDK_STABLE_VERSION;
    }
}
