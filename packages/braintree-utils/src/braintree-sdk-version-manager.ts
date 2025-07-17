import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { BRAINTREE_SDK_STABLE_VERSION } from './braintree-sdk-verison';

export default class BraintreeSDKVersionManager {
    // TODO: remove ts-ignore when paymentIntegrationService will be used to determine braintree version by experiment name
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    constructor(private paymentIntegrationService: PaymentIntegrationService) {}

    getSDKVersion() {
        return BRAINTREE_SDK_STABLE_VERSION;
    }
}
