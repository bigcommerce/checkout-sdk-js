import { getScriptLoader } from '@bigcommerce/script-loader';

import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';

import BraintreeScriptLoader from './braintree-script-loader';
import BraintreeSdk from './braintree-sdk';
import BraintreeSDKVersionManager from './braintree-sdk-version-manager';

const createBraintreeSdk = (paymentIntegrationService: PaymentIntegrationService) => {
    const braintreeSDKVersionManager = new BraintreeSDKVersionManager(paymentIntegrationService);
    const braintreeScriptLoader = new BraintreeScriptLoader(
        getScriptLoader(),
        window,
        braintreeSDKVersionManager,
    );

    return new BraintreeSdk(braintreeScriptLoader);
};

export default createBraintreeSdk;
